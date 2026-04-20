/**
 * DynamicRenderer
 * ---------------
 * Renders a UISchema produced by the Python UIRenderer agent.
 * Each layout maps to a specific visual pattern; each component type
 * maps to a leaf-level React element.
 *
 * No external UI library required — pure Tailwind CSS.
 */

import {
  CheckCircle,
  AlertCircle,
  FolderOpen,
  Ticket,
  LayoutGrid,
  List,
  Code,
  Tag,
  ChevronRight,
} from 'lucide-react';
import type { UIAction, UIComponent, UISchema } from '../types/chat';
import { cn } from '../lib/utils';

interface Props {
  schema: UISchema;
  /** Called when the user clicks an action button */
  onAction?: (tool: string, args: Record<string, unknown>) => void;
}

// ============================================================================
// Layout wrappers
// ============================================================================

function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
      {children}
    </div>
  );
}

function TableLayout({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 overflow-x-auto">{children}</div>;
}

function DetailLayout({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 space-y-3">{children}</div>;
}

function KanbanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
      {children}
    </div>
  );
}

function ListLayout({ children }: { children: React.ReactNode }) {
  return <div className="mt-2 divide-y divide-gray-100 dark:divide-gray-700">{children}</div>;
}

// ============================================================================
// Component renderers
// ============================================================================

function ProjectCard({ props }: { props: Record<string, unknown> }) {
  const status = String(props.status ?? '');
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    archived: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FolderOpen className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="font-medium text-gray-900 dark:text-white truncate">
            {String(props.name ?? 'Untitled')}
          </span>
        </div>
        {status && (
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full shrink-0',
              statusColors[status.toLowerCase()] ?? 'bg-gray-100 text-gray-600'
            )}
          >
            {status}
          </span>
        )}
      </div>
      {props.description && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          {String(props.description)}
        </p>
      )}
      {props.identifier && (
        <p className="mt-2 text-xs font-mono text-gray-400 dark:text-gray-500">
          #{String(props.identifier)}
        </p>
      )}
    </div>
  );
}

function TicketCard({ props }: { props: Record<string, unknown> }) {
  const priority = String(props.priority ?? '');
  const priorityColors: Record<string, string> = {
    urgent: 'text-red-600 dark:text-red-400',
    high: 'text-orange-500 dark:text-orange-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    low: 'text-green-600 dark:text-green-400',
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-2">
        <Ticket className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {String(props.name ?? 'Untitled Ticket')}
          </p>
          {props.description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {String(props.description)}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {props.status && (
              <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                {String(props.status)}
              </span>
            )}
            {priority && (
              <span className={cn('text-xs font-medium', priorityColors[priority.toLowerCase()] ?? '')}>
                ↑ {priority}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TableComponent({ props }: { props: Record<string, unknown> }) {
  const headers = (props.headers as string[]) ?? [];
  const rows = (props.rows as unknown[][]) ?? [];

  if (!headers.length && !rows.length) return null;

  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
      {headers.length > 0 && (
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {rows.map((row, ri) => (
          <tr key={ri} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
            {row.map((cell, ci) => (
              <td key={ci} className="px-3 py-2 text-gray-700 dark:text-gray-300">
                {String(cell ?? '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BadgeComponent({ props }: { props: Record<string, unknown> }) {
  const colorMap: Record<string, string> = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
  };
  const color = String(props.color ?? 'gray');

  return (
    <span className={cn('inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium', colorMap[color] ?? colorMap.gray)}>
      <Tag className="w-3 h-3" />
      {String(props.label ?? '')}
    </span>
  );
}

function StatComponent({ props }: { props: Record<string, unknown> }) {
  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 px-4 py-3">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {String(props.label ?? '')}
      </p>
      <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
        {String(props.value ?? '')}
      </p>
      {props.sub && (
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{String(props.sub)}</p>
      )}
    </div>
  );
}

function ListItemComponent({ props }: { props: Record<string, unknown> }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-1 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded">
      <div className="flex items-center gap-2 min-w-0">
        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {String(props.title ?? props.name ?? '')}
          </p>
          {props.subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{String(props.subtitle)}</p>
          )}
        </div>
      </div>
      {props.badge && (
        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full shrink-0 ml-2">
          {String(props.badge)}
        </span>
      )}
    </div>
  );
}

function KanbanColumn({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as string[]) ?? [];

  return (
    <div className="min-w-[180px] rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          {String(props.name ?? props.title ?? 'Column')}
        </p>
        <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full px-1.5 py-0.5">
          {items.length}
        </span>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300"
          >
            {String(item)}
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center py-2">
            Empty
          </p>
        )}
      </div>
    </div>
  );
}

function SuccessBanner({ props }: { props: Record<string, unknown> }) {
  return (
    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
      <div className="flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-green-800 dark:text-green-200">
            {String(props.message ?? 'Done!')}
          </p>
          {props.detail && (
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              {String(props.detail)}
            </p>
          )}
          {props.id && (
            <p className="mt-1 text-xs font-mono text-green-600 dark:text-green-400">
              ID: {String(props.id)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorBanner({ props }: { props: Record<string, unknown> }) {
  return (
    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-red-800 dark:text-red-200">
            {String(props.message ?? 'An error occurred')}
          </p>
          {props.detail && (
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">{String(props.detail)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function JsonViewer({ props }: { props: Record<string, unknown> }) {
  return (
    <details className="mt-1">
      <summary className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none">
        <Code className="w-3.5 h-3.5" />
        {String(props.label ?? 'Raw data')}
      </summary>
      <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 p-3 rounded overflow-x-auto">
        {JSON.stringify(props.data, null, 2)}
      </pre>
    </details>
  );
}

// ============================================================================
// Component dispatcher
// ============================================================================

function renderComponent(
  component: UIComponent,
  index: number,
): React.ReactNode {
  const { type, props } = component;
  const key = `${type}-${index}`;

  switch (type) {
    case 'card':         return <ProjectCard key={key} props={props} />;
    case 'ticket-card':  return <TicketCard key={key} props={props} />;
    case 'table':        return <TableComponent key={key} props={props} />;
    case 'badge':        return <BadgeComponent key={key} props={props} />;
    case 'stat':         return <StatComponent key={key} props={props} />;
    case 'list-item':    return <ListItemComponent key={key} props={props} />;
    case 'kanban-column': return <KanbanColumn key={key} props={props} />;
    case 'success-banner': return <SuccessBanner key={key} props={props} />;
    case 'error-banner': return <ErrorBanner key={key} props={props} />;
    case 'json-viewer':  return <JsonViewer key={key} props={props} />;
    default:             return null;
  }
}

// ============================================================================
// Action buttons
// ============================================================================

function ActionButton({
  action,
  onAction,
}: {
  action: UIAction;
  onAction?: (tool: string, args: Record<string, unknown>) => void;
}) {
  const styleMap = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary:
      'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <button
      onClick={() => onAction?.(action.tool, action.args)}
      className={cn(
        'px-3 py-1.5 text-sm rounded-lg font-medium transition-colors',
        styleMap[action.style] ?? styleMap.secondary
      )}
    >
      {action.label}
    </button>
  );
}

// ============================================================================
// Layout dispatcher
// ============================================================================

function renderLayout(schema: UISchema, onAction?: Props['onAction']): React.ReactNode {
  const { layout, components } = schema;
  const rendered = components.map(renderComponent);

  switch (layout) {
    case 'card-grid':
      return <CardGrid>{rendered}</CardGrid>;

    case 'table':
      return <TableLayout>{rendered}</TableLayout>;

    case 'detail':
      return (
        <DetailLayout>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {rendered}
          </div>
        </DetailLayout>
      );

    case 'kanban':
      return <KanbanLayout>{rendered}</KanbanLayout>;

    case 'list':
      return <ListLayout>{rendered}</ListLayout>;

    case 'success':
      return <div className="mt-3 space-y-2">{rendered}</div>;

    case 'error':
      return <div className="mt-3 space-y-2">{rendered}</div>;

    case 'empty':
      return (
        <div className="mt-4 text-center text-gray-400 dark:text-gray-500 text-sm py-6">
          <LayoutGrid className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>{schema.subtitle ?? 'No data'}</p>
        </div>
      );

    default:
      return (
        <div className="mt-3">
          <List className="w-4 h-4 inline mr-1 text-gray-400" />
          {rendered}
        </div>
      );
  }
}

// ============================================================================
// Main export
// ============================================================================

export default function DynamicRenderer({ schema, onAction }: Props) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
          {schema.title}
        </h3>
        {schema.subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {schema.subtitle}
          </p>
        )}
      </div>

      {/* Components */}
      {renderLayout(schema, onAction)}

      {/* Action buttons */}
      {schema.actions && schema.actions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {schema.actions.map((action, i) => (
            <ActionButton key={i} action={action} onAction={onAction} />
          ))}
        </div>
      )}

      {/* Metadata */}
      {schema.metadata && Object.keys(schema.metadata).length > 0 && (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          {Object.entries(schema.metadata)
            .map(([k, v]) => `${k}: ${v}`)
            .join(' · ')}
        </p>
      )}
    </div>
  );
}
