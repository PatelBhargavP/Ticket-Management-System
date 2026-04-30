import { useState } from 'react';
import { ChevronDown, ChevronRight, Cpu, Wrench, Layers, AlertCircle } from 'lucide-react';
import type { AgentLog, ChatMessage } from '../types/chat';
import { cn } from '../lib/utils';
import DynamicRenderer from './DynamicRenderer';

interface MessageBubbleProps {
  message: ChatMessage;
  /** Forward action clicks to the parent so it can trigger a new agent call */
  onAction?: (tool: string, args: Record<string, unknown>) => void;
  /** Whether the message is still streaming (prevents showing blank bubbles) */
  isLoading?: boolean;
}

/**
 * Returns true if a string looks like raw JSON output from the ui_renderer
 * node — e.g. starts with `{` or `[` after trimming.  Used to suppress JSON
 * noise in the plain-text fallback path.
 */
function isJsonLike(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return (t.startsWith('{') || t.startsWith('[')) && t.length > 2;
}

// ---------------------------------------------------------------------------
// Agent trace panel (collapsible)
// ---------------------------------------------------------------------------

const logIcons: Record<AgentLog['kind'], React.ReactNode> = {
  thinking:      <Cpu className="w-3 h-3 text-blue-400" />,
  tool_selected: <Wrench className="w-3 h-3 text-amber-400" />,
  tool_executing:<Wrench className="w-3 h-3 text-amber-500 animate-pulse" />,
  tool_result:   <Layers className="w-3 h-3 text-green-400" />,
  ui_generating: <Layers className="w-3 h-3 text-purple-400 animate-pulse" />,
};

const logLabels: Record<AgentLog['kind'], string> = {
  thinking:      'Thinking',
  tool_selected: 'Tool selected',
  tool_executing:'Executing',
  tool_result:   'Tool result',
  ui_generating: 'Rendering UI',
};

function AgentTrace({ logs }: { logs: AgentLog[] }) {
  const [open, setOpen] = useState(false);

  if (!logs.length) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors select-none"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        Agent trace ({logs.length} steps)
      </button>

      {open && (
        <div className="mt-1.5 space-y-1 border-l-2 border-gray-200 dark:border-gray-600 pl-3">
          {logs.map((log, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="mt-0.5 shrink-0">{logIcons[log.kind]}</span>
              <div className="min-w-0">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {logLabels[log.kind]}
                </span>
                {log.kind === 'tool_selected' && (
                  <span className="ml-1 text-xs font-mono text-amber-600 dark:text-amber-400">
                    {String(log.payload.tool ?? '')}
                    {log.payload.reasoning && (
                      <span className="text-gray-400 dark:text-gray-500 font-sans">
                        {' — '}{String(log.payload.reasoning)}
                      </span>
                    )}
                  </span>
                )}
                {log.kind === 'thinking' && (
                  <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
                    {String(log.payload.message ?? '')}
                  </span>
                )}
                {log.kind === 'tool_result' && (
                  <details className="mt-0.5">
                    <summary className="text-xs text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300">
                      View raw result
                    </summary>
                    <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 p-2 rounded overflow-x-auto max-h-40">
                      {JSON.stringify(log.payload.result, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function MessageBubble({ message, onAction, isLoading }: MessageBubbleProps) {
  const isUser  = message.role === 'user';
  const isError = !!message.error;

  // Determine the primary body to render for assistant messages
  function renderAssistantBody() {
    // 1. UI schema — highest priority, full generative render
    if (message.uiSchema) {
      return <DynamicRenderer schema={message.uiSchema} onAction={onAction} />;
    }

    // 2. Error state — show a styled error banner
    if (isError) {
      return (
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm">{message.error}</p>
        </div>
      );
    }

    // 3. JSON-like content (leaked ui_renderer tokens) — show a "Generating UI" pill
    //    while still streaming; hide it once done (the ui_schema event missed/never came)
    if (isJsonLike(message.content)) {
      if (isLoading) {
        return (
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 italic">
            <span className="inline-block w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
            Generating UI…
          </div>
        );
      }
      // Stream done but ui_schema never arrived — show a json-viewer as fallback
      return (
        <details>
          <summary className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200">
            Response (raw)
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 p-3 rounded overflow-x-auto max-h-60">
            {message.content}
          </pre>
        </details>
      );
    }

    // 4. Plain text content
    if (message.content.trim()) {
      return (
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
      );
    }

    // 5. Empty content while streaming (agent is thinking, before first token)
    if (isLoading) {
      return (
        <div className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 italic">
          <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      );
    }

    // 6. Truly empty completed message — show nothing rather than blank bubble
    return null;
  }

  const body = renderAssistantBody();
  const hasLogs = !isUser && (message.agentLogs?.length ?? 0) > 0;
  const hasLegacyResult = !isUser && !message.uiSchema && message.toolResult;

  // Skip rendering an empty assistant bubble altogether (edge case: stream error, nothing came through)
  if (!isUser && !isLoading && body === null && !hasLogs && !hasLegacyResult) {
    return null;
  }

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'rounded-lg px-4 py-2',
          isUser
            ? 'max-w-[75%] bg-blue-600 text-white'
            : isError
            ? 'max-w-[85%] bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-800'
            : 'w-full max-w-[85%] bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
        ) : (
          body
        )}

        {/* Agent trace (collapsible) */}
        {hasLogs && <AgentTrace logs={message.agentLogs!} />}

        {/* Legacy tool result viewer (backward compat) */}
        {hasLegacyResult && (
          <details className="mt-2">
            <summary className="text-xs opacity-75 cursor-pointer">View details</summary>
            <pre className="mt-2 text-xs overflow-x-auto bg-gray-100 dark:bg-gray-900 p-2 rounded max-h-40">
              {JSON.stringify(message.toolResult, null, 2)}
            </pre>
          </details>
        )}

        <div className="text-xs opacity-50 mt-1.5 text-right">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
