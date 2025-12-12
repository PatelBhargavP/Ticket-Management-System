/**
 * Natural Language Parser
 * 
 * Maps natural language commands to MCP tool calls
 */

export interface ParsedCommand {
  tool: string;
  args: Record<string, unknown>;
}

export class NLPParser {
  /**
   * Parse natural language input into MCP tool call
   */
  parse(input: string): ParsedCommand | null {
    const normalized = input.toLowerCase().trim();

    // Project operations
    if (this.matches(normalized, ['create project', 'new project', 'add project'])) {
      return this.parseCreateProject(normalized);
    }

    if (this.matches(normalized, ['list projects', 'show projects', 'get projects', 'all projects'])) {
      return {
        tool: 'project_list',
        args: {},
      };
    }

    if (this.matches(normalized, ['get project', 'show project', 'find project'])) {
      return this.parseGetProject(normalized);
    }

    // Ticket operations
    if (this.matches(normalized, ['create ticket', 'new ticket', 'add ticket'])) {
      return this.parseCreateTicket(normalized);
    }

    if (this.matches(normalized, ['update ticket', 'modify ticket', 'edit ticket'])) {
      return this.parseUpdateTicket(normalized);
    }

    // Kanban operations
    if (this.matches(normalized, ['set column order', 'reorder columns', 'kanban order'])) {
      return this.parseKanbanOrder(normalized);
    }

    return null;
  }

  private matches(input: string, patterns: string[]): boolean {
    return patterns.some(pattern => input.includes(pattern));
  }

  private parseCreateProject(input: string): ParsedCommand | null {
    // Extract project name
    // Patterns: "create project called X", "create project X", "new project X"
    const nameMatch = input.match(/(?:called|named|with name|:)\s*["']?([^"']+)["']?/i) ||
                     input.match(/(?:project|proj)\s+["']?([^"']+)["']?/i);
    
    const name = nameMatch ? nameMatch[1].trim() : this.extractAfterKeyword(input, ['project', 'proj']);

    if (!name) {
      return null;
    }

    // Extract identifier (optional)
    const identifierMatch = input.match(/(?:identifier|id|code)\s*[:=]\s*["']?([^"']+)["']?/i);
    const identifier = identifierMatch ? identifierMatch[1].trim() : undefined;

    return {
      tool: 'project_create',
      args: {
        name,
        ...(identifier && { identifier }),
      },
    };
  }

  private parseGetProject(input: string): ParsedCommand | null {
    // Extract identifier
    const identifierMatch = input.match(/(?:identifier|id|code|with)\s*[:=]?\s*["']?([^"'\s]+)["']?/i) ||
                           input.match(/["']([^"']+)["']/);
    
    const identifier = identifierMatch ? identifierMatch[1].trim() : this.extractAfterKeyword(input, ['project', 'identifier']);

    if (!identifier) {
      return null;
    }

    return {
      tool: 'project_get_by_identifier',
      args: { identifier },
    };
  }

  private parseCreateTicket(input: string): ParsedCommand | null {
    // Extract ticket name
    const nameMatch = input.match(/(?:called|named|with name|:)\s*["']?([^"']+)["']?/i) ||
                     input.match(/(?:ticket)\s+["']?([^"']+)["']?/i);
    
    const name = nameMatch ? nameMatch[1].trim() : this.extractAfterKeyword(input, ['ticket']);

    if (!name) {
      return null;
    }

    // Extract project ID
    const projectMatch = input.match(/(?:project|proj|in)\s*(?:id|identifier)?\s*[:=]?\s*["']?([^"'\s]+)["']?/i);
    const projectId = projectMatch ? projectMatch[1].trim() : undefined;

    if (!projectId) {
      return null; // Project ID is required
    }

    // Extract description (optional)
    const descMatch = input.match(/(?:description|desc|details?)\s*[:=]\s*["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : undefined;

    return {
      tool: 'ticket_create',
      args: {
        projectId,
        name,
        ...(description && { description }),
      },
    };
  }

  private parseUpdateTicket(input: string): ParsedCommand | null {
    // Extract ticket ID
    const ticketMatch = input.match(/(?:ticket|id)\s*(?:id|#)?\s*[:=]?\s*["']?([^"'\s]+)["']?/i);
    const ticketId = ticketMatch ? ticketMatch[1].trim() : undefined;

    if (!ticketId) {
      return null;
    }

    // Extract project ID
    const projectMatch = input.match(/(?:project|proj)\s*(?:id|identifier)?\s*[:=]?\s*["']?([^"'\s]+)["']?/i);
    const projectId = projectMatch ? projectMatch[1].trim() : undefined;

    if (!projectId) {
      return null;
    }

    const args: Record<string, unknown> = {
      ticketId,
      projectId,
    };

    // Extract name update
    const nameMatch = input.match(/(?:name|title)\s*[:=]\s*["']([^"']+)["']/i);
    if (nameMatch) {
      args.name = nameMatch[1].trim();
    }

    // Extract description update
    const descMatch = input.match(/(?:description|desc)\s*[:=]\s*["']([^"']+)["']/i);
    if (descMatch) {
      args.description = descMatch[1].trim();
    }

    return {
      tool: 'ticket_update',
      args,
    };
  }

  private parseKanbanOrder(input: string): ParsedCommand | null {
    // Extract project ID
    const projectMatch = input.match(/(?:project|proj)\s*(?:id|identifier)?\s*[:=]?\s*["']?([^"'\s]+)["']?/i);
    const projectId = projectMatch ? projectMatch[1].trim() : undefined;

    if (!projectId) {
      return null;
    }

    // Extract group type (status or priority)
    const groupType = input.includes('priority') ? 'priority' : 'status';

    // Extract column IDs (simplified - in real implementation, might need more parsing)
    const columnsMatch = input.match(/(?:columns|order)\s*[:=]\s*\[([^\]]+)\]/i);
    const columns = columnsMatch 
      ? columnsMatch[1].split(',').map(c => c.trim().replace(/["']/g, ''))
      : [];

    if (columns.length === 0) {
      return null;
    }

    return {
      tool: 'kanban_set_column_order',
      args: {
        projectId,
        groupType,
        columns,
      },
    };
  }

  private extractAfterKeyword(input: string, keywords: string[]): string | null {
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}\\s+["']?([^"']+)["']?`, 'i');
      const match = input.match(regex);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  }
}
