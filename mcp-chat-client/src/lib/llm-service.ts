/**
 * LLM Service
 *
 * Wraps the Google Gemini API and implements the agentic tool-use loop.
 * The caller supplies an `onToolCall` callback that executes the chosen tool
 * via the MCP client, and an optional `onStatusChange` callback for live
 * status updates shown in the chat UI.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Content, Part } from '@google/generative-ai';
import type { MCPTool } from './mcp-client';

// ── Public types ────────────────────────────────────────────────────────────

/** One entry in the conversation history kept between turns (Gemini Content). */
export type ConversationMessage = Content;

export interface LLMServiceOptions {
  apiKey: string;
  /** Gemini model ID. Defaults to gemini-2.0-flash (free tier). */
  model?: string;
}

export interface ChatResult {
  /** The assistant's final natural-language reply. */
  response: string;
  /** Full updated conversation history to be persisted by the caller. */
  updatedHistory: ConversationMessage[];
}

// ── Schema sanitizer ────────────────────────────────────────────────────────

type JsonObj = Record<string, unknown>;

/**
 * Whitelist-based sanitizer that keeps ONLY the JSON Schema fields the
 * Gemini API accepts.  A blocklist approach fails because the MCP SDK may
 * include Zod's internal `_def` property (serialised as `def` by Gemini's
 * protobuf parser → "Unknown name" 400 error) as well as `$defs`, `$schema`,
 * `additionalProperties`, and other unsupported keywords.
 *
 * Allowed fields: https://ai.google.dev/api/generate-content#v1beta.Schema
 */
const GEMINI_SCHEMA_FIELDS = new Set([
  'type', 'format', 'description', 'nullable',
  'enum', 'properties', 'required', 'items',
  'anyOf', 'oneOf',
]);

function sanitizeSchemaForGemini(schema: unknown): unknown {
  if (typeof schema !== 'object' || schema === null) return schema;
  if (Array.isArray(schema)) return schema.map(sanitizeSchemaForGemini);

  const out: JsonObj = {};
  for (const [key, val] of Object.entries(schema as JsonObj)) {
    if (!GEMINI_SCHEMA_FIELDS.has(key)) continue;   // whitelist — skip everything else
    out[key] = sanitizeSchemaForGemini(val);
  }
  return out;
}

// ── Constants ────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `\
You are a helpful assistant for a Ticket Management System.
Help users manage their projects, tickets, and kanban boards through natural conversation.

Guidelines:
- When users ask you to perform actions, use the available tools to do so.
- After a tool call, summarise the result clearly and conversationally — do NOT dump raw JSON.
- If a required argument is missing, ask the user for it before calling the tool.
- If a tool call fails, explain what went wrong in plain language.
- Keep responses concise unless the user asks for more detail.`;

const MAX_TOOL_ITERATIONS = 10;

// ── LLMService ───────────────────────────────────────────────────────────────

export class LLMService {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor({ apiKey, model = 'gemini-2.0-flash' }: LLMServiceOptions) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  /**
   * Send the latest user message (last entry in `history`) to Gemini and
   * handle the full function-calling agentic loop.
   *
   * @param history        - Full conversation history; the last item is the new user turn.
   * @param tools          - MCP tools to advertise to the model.
   * @param onToolCall     - Executes a tool and returns its result.
   * @param onStatusChange - Optional callback for "Thinking…" / "Calling: …" updates.
   */
  async chat(
    history: ConversationMessage[],
    tools: MCPTool[],
    onToolCall: (name: string, args: Record<string, unknown>) => Promise<unknown>,
    onStatusChange?: (status: string) => void,
  ): Promise<ChatResult> {
    // Build Gemini function declarations from MCP tool schemas.
    // sanitizeSchemaForGemini strips everything not on the Gemini whitelist.
    const functionDeclarations = tools.map((t) => ({
      name: t.name,
      description: t.description ?? '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parameters: sanitizeSchemaForGemini(t.inputSchema) as any,
    }));

    // Split history: everything before the last item is prior context;
    // the last item is the current user message.
    const priorHistory = history.slice(0, -1);
    const lastContent = history[history.length - 1];
    const userText = lastContent.parts
      .filter((p): p is { text: string } => 'text' in p)
      .map((p) => p.text)
      .join('');

    const geminiModel = this.genAI.getGenerativeModel({
      model: this.model,
      systemInstruction: SYSTEM_PROMPT,
      tools: functionDeclarations.length > 0 ? [{ functionDeclarations }] : undefined,
    });

    const chatSession = geminiModel.startChat({ history: priorHistory });

    onStatusChange?.('Thinking…');
    let result = await chatSession.sendMessage(userText);

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const parts: Part[] = result.response.candidates?.[0]?.content?.parts ?? [];
      const fnCalls = parts.filter((p) => 'functionCall' in p) as Array<{ functionCall: { name: string; args: Record<string, unknown> } }>;

      if (fnCalls.length === 0) {
        // No function calls — return the final text response.
        const text = result.response.text();
        const updatedHistory = await chatSession.getHistory();
        return { response: text || '(No response)', updatedHistory };
      }

      // Execute each function call and collect responses.
      const responseParts: Part[] = [];
      for (const { functionCall: { name, args } } of fnCalls) {
        onStatusChange?.(`Calling: ${name}…`);
        try {
          const toolResult = await onToolCall(name, args);
          responseParts.push({ functionResponse: { name, response: { result: toolResult } } });
        } catch (err) {
          responseParts.push({ functionResponse: { name, response: { error: err instanceof Error ? err.message : String(err) } } });
        }
      }

      onStatusChange?.('Thinking…');
      result = await chatSession.sendMessage(responseParts);
    }

    const updatedHistory = await chatSession.getHistory();
    return {
      response: 'Reached the maximum number of tool-call iterations. Please try rephrasing your request.',
      updatedHistory,
    };
  }
}

