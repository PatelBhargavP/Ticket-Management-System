'use server'

import dbConnect from '@/lib/db'
import { appUserAttributes, castTicketDocumentToDetails, priorityAttributes, projectBaseAttributes, statusAttributes } from '@/lib/utils'
import { PaginatedData, PaginationParams, Ticket } from '@/models'
import { ITicketDetails, ITicketDocument } from '@/models/Ticket'
import { QueryFilter } from 'mongoose'


const defaultParams: PaginationParams = {
  page: 1,
  pageSize: 100,
  sortBy: 'createdAt',
  sortOrder: 'desc'
}
export async function getPaginatedProjectTickets(projectId: string, filter: QueryFilter<ITicketDocument>, params: Partial<PaginationParams> = defaultParams) {
  await dbConnect()
  const pageParams = {
    ...defaultParams,
    ...params
  }
  filter.projectId = projectId;

  const skip = (pageParams.page - 1) * pageParams.pageSize
  const sortOptions: Record<string, 1 | -1> = {
    [pageParams.sortBy]: pageParams.sortOrder === 'asc' ? 1 : -1
  }

  const [totalRecords, ticket] = await Promise.all([
    Ticket.countDocuments(filter),
    Ticket.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageParams.pageSize)
      .populate('assigneeIds', appUserAttributes)
      .populate('projectId', projectBaseAttributes)
      .populate('statusId', statusAttributes)
      .populate('priorityId', priorityAttributes)
      .populate('updatedById', appUserAttributes)
      .populate('createdById', appUserAttributes)
      .lean<ITicketDocument[]>()
  ])

  return {
    data: ticket.map(p => castTicketDocumentToDetails(p)),
    totalRecords,
    totalPages: Math.ceil(totalRecords / pageParams.pageSize),
    ...pageParams
  } as PaginatedData<ITicketDetails>
}
