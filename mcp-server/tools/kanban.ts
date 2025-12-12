/**
 * Kanban board-related MCP tools
 */

import { z } from 'zod';
import { ApiClient } from '../api-client';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ProjectTool } from './projects';

export const kanbanSetColumnOrderSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  groupType: z.enum(['status', 'priority'], {
    errorMap: () => ({ message: 'Group type must be either "status" or "priority"' }),
  }),
  columns: z.array(z.string()).min(1, 'At least one column ID is required'),
  projectIdentifier: z.string().optional(),
});

export const kanbanGetColumnOrderSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  groupType: z.enum(['status', 'priority'], {
    errorMap: () => ({ message: 'Group type must be either "status" or "priority"' }),
  }),
});

export const kanbanTools: ProjectTool[] = [
  {
    name: 'kanban_set_column_order',
    description: 'Set the column order for a kanban board grouped by status or priority',
    inputSchema: kanbanSetColumnOrderSchema,
    handler: async (args: unknown, client: ApiClient): Promise<CallToolResult> => {
      try {
        const validatedArgs = kanbanSetColumnOrderSchema.parse(args);
        const result = await client.post('/api/kanban/column-order', validatedArgs);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error setting kanban column order: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    },
  },
  {
    name: 'kanban_get_column_order',
    description: 'Get the column order for a kanban board grouped by status or priority',
    inputSchema: kanbanGetColumnOrderSchema,
    handler: async (args: unknown, client: ApiClient): Promise<CallToolResult> => {
      try {
        const validatedArgs = kanbanGetColumnOrderSchema.parse(args);
        // Note: This endpoint may need to be implemented in the API
        // For now, we'll return a helpful message
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                message: 'Get column order endpoint not yet implemented in API',
                projectId: validatedArgs.projectId,
                groupType: validatedArgs.groupType,
                note: 'You may need to implement GET /api/kanban/column-order endpoint',
              }, null, 2),
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error getting kanban column order: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    },
  },
];


