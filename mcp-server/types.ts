/**
 * Type definitions for the Ticket Management System MCP Server
 */

export interface MCPConfig {
  apiBaseUrl: string;
  authToken?: string; // Bearer token or NextAuth session cookie
}

export interface ProjectCreateInput {
  name: string;
  identifier?: string;
  memberIds?: string[];
}

export interface ProjectUpdateInput {
  projectId: string;
  name?: string;
  memberIds?: string[];
}

export interface TicketCreateInput {
  projectId: string;
  name: string;
  description?: string;
  assigneeIds?: string[];
  statusId?: string;
  priorityId?: string;
}

export interface TicketUpdateInput {
  ticketId: string;
  projectId: string;
  name?: string;
  description?: string;
  assigneeIds?: string[];
  statusId?: string;
  priorityId?: string;
}

export interface KanbanColumnOrderInput {
  projectId: string;
  groupType: 'status' | 'priority';
  columns: string[];
  projectIdentifier?: string;
}

export interface ApiError {
  error: string;
  message?: string;
}


