// ---------------------------------------------------------------------------
// UI Schema types  (mirrors schemas/ui_schema.py on the Python server)
// ---------------------------------------------------------------------------

export type UILayout =
  | 'card-grid'
  | 'table'
  | 'detail'
  | 'kanban'
  | 'success'
  | 'error'
  | 'list'
  | 'empty';

export type UIComponentType =
  | 'card'
  | 'ticket-card'
  | 'table'
  | 'badge'
  | 'stat'
  | 'list-item'
  | 'kanban-column'
  | 'success-banner'
  | 'error-banner'
  | 'json-viewer';

export interface UIComponent {
  type: UIComponentType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>;
}

export interface UIAction {
  label: string;
  tool: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: Record<string, any>;
  style: 'primary' | 'secondary' | 'danger';
}

export interface UISchema {
  layout: UILayout;
  title: string;
  subtitle?: string;
  components: UIComponent[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  actions: UIAction[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>;
}

// ---------------------------------------------------------------------------
// Agent log entry  (shown in the collapsible trace panel)
// ---------------------------------------------------------------------------

export type AgentLogKind =
  | 'thinking'
  | 'tool_selected'
  | 'tool_executing'
  | 'tool_result'
  | 'ui_generating';

export interface AgentLog {
  kind: AgentLogKind;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>;
  ts: number; // Date.now()
}

// ---------------------------------------------------------------------------
// Chat message
// ---------------------------------------------------------------------------

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  /** Plain-text portion (token-streamed text from agents) */
  content: string;
  timestamp: Date;
  /** Dynamic UI schema — when present, DynamicRenderer is used instead of plain text */
  uiSchema?: UISchema;
  /** Agent execution trace */
  agentLogs?: AgentLog[];
  /** Legacy MCP direct-call result (kept for backward compat) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolResult?: unknown;
  error?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}
