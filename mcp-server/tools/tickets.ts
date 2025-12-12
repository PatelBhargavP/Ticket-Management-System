/**
 * Ticket-related MCP tools
 */

import { z } from 'zod';
import { ApiClient } from '../api-client';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ProjectTool } from './projects';

export const ticketCreateSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  name: z.string().min(1, 'Ticket name is required'),
  description: z.string().optional(),
  assigneeIds: z.array(z.string()).optional(),
  statusId: z.string().optional(),
  priorityId: z.string().optional(),
});

export const ticketUpdateSchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  name: z.string().optional(),
  description: z.string().optional(),
  assigneeIds: z.array(z.string()).optional(),
  statusId: z.string().optional(),
  priorityId: z.string().optional(),
});

export const ticketTools: ProjectTool[] = [
  {
    name: 'ticket_create',
    description: 'Create a new ticket in a project',
    inputSchema: ticketCreateSchema,
    handler: async (args: unknown, client: ApiClient): Promise<CallToolResult> => {
      try {
        const validatedArgs = ticketCreateSchema.parse(args);
        const result = await client.post('/api/ticket/create', validatedArgs);
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
              text: `Error creating ticket: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    },
  },
  {
    name: 'ticket_update',
    description: 'Update an existing ticket in a project',
    inputSchema: ticketUpdateSchema,
    handler: async (args: unknown, client: ApiClient): Promise<CallToolResult> => {
      try {
        const validatedArgs = ticketUpdateSchema.parse(args);
        const result = await client.post('/api/ticket/update', validatedArgs);
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
              text: `Error updating ticket: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    },
  },
];


