/**
 * Project-related MCP tools
 */

import { z } from 'zod';
import { ApiClient } from '../api-client';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export const projectCreateSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  identifier: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
});

export const projectUpdateSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  name: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
});

export const projectGetByIdentifierSchema = z.object({
  identifier: z.string().min(1, 'Project identifier is required'),
});

export interface ProjectTool {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  handler: (args: unknown, client: ApiClient) => Promise<CallToolResult>;
}

export const projectTools: ProjectTool[] = [
  {
    name: 'project_create',
    description: 'Create a new project in the ticket management system',
    inputSchema: projectCreateSchema,
    handler: async (args: unknown, client: ApiClient): Promise<CallToolResult> => {
      try {
        const validatedArgs = projectCreateSchema.parse(args);
        const result = await client.post('/api/project/create', validatedArgs);
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
              text: `Error creating project: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    },
  },
  {
    name: 'project_update',
    description: 'Update an existing project in the ticket management system',
    inputSchema: projectUpdateSchema,
    handler: async (args: unknown, client: ApiClient): Promise<CallToolResult> => {
      try {
        const validatedArgs = projectUpdateSchema.parse(args);
        const result = await client.post('/api/project/update', validatedArgs);
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
              text: `Error updating project: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    },
  },
  {
    name: 'project_list',
    description: 'Get all projects for the authenticated user',
    inputSchema: z.object({}),
    handler: async (_args: unknown, client: ApiClient): Promise<CallToolResult> => {
      try {
        const result = await client.get('/api/projects');
        
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
              text: `Error fetching projects: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    },
  },
  {
    name: 'project_get_by_identifier',
    description: 'Get a project by its identifier (public endpoint, no auth required)',
    inputSchema: projectGetByIdentifierSchema,
    handler: async (args: unknown, client: ApiClient): Promise<CallToolResult> => {
      try {
        const validatedArgs = projectGetByIdentifierSchema.parse(args);
        const result = await client.get(`/api/project/identifier/${encodeURIComponent(validatedArgs.identifier)}`);
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
              text: `Error fetching project: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    },
  },
];


