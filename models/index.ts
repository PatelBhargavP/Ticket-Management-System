import { AppUser } from './User';
import { Priority } from './Priority';
import { Project } from './Project';
import { Ticket } from './Ticket';
import { Status } from './Status';

export {
  AppUser,
  Project,
  Ticket,
  Status,
  Priority
};

export interface PaginationParams {
  page: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export interface PaginatedData<T> extends PaginationParams {
  data: T[];
  totalRecords: number;
  totalPages: number;
}

export type GroupingType = 'status' | 'priority' | 'none';
export interface GroupedData<T, E> {
  data: T[];
  groupEntity: E;
  groupType: GroupingType;
}