import { IPriority, IPriorityDocument } from "@/models/Priority";
import { IProjectBase, IProjectDetails, IProjectDocument } from "@/models/Project";
import { IStatus, IStatusDocument } from "@/models/Status";
import { ITicketDetails, ITicketDocument } from "@/models/Ticket";
import { ITransactionDetails, ITransactionDocument, ITransactionEntityDetails, ITransactionField, ITransactionValues } from "@/models/Transaction";
import { IAppUser, IAppUserDocument } from "@/models/User";
import { clsx, type ClassValue } from "clsx"
import { Query, QueryWithHelpers } from "mongoose";
import { User } from "next-auth";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const okaResponseStatus = {
  status: 200,
  headers: { 'Content-Type': 'application/json' }
}


export function converUserToAppUser(user: User) {
  const nameArray = user.name?.split(" ");
  return {
    email: user.email,
    image: user.image,
    firstname: nameArray ? nameArray[0] : '',
    lastname: nameArray ? nameArray[1] : '',
    fullname: user.name || '',
  } as IAppUser;
}

export function castProjectDocumentToDetails(project: IProjectDocument) {
  const projectDetails = {
    projectId: project.id || project._id.toString(),
    name: project.name,
    identifier: project.identifier,
    createdAt: project.createdAt.toString(),
    updatedAt: project.updatedAt.toString(),
    members: project.memberIds as IAppUser[]
  } as IProjectDetails;
  return projectDetails;
}

export function castTicketDocumentToDetails(ticket: ITicketDocument) {
  const projectDetails = {
    ticketId: ticket.id || ticket._id.toString(),
    name: ticket.name,
    description: ticket.description,
    identifier: ticket.identifier,
    createdAt: ticket.createdAt.toString(),
    updatedAt: ticket.updatedAt.toString(),
    assignee: ticket.assigneeIds as IAppUser[],
    status: ticket.statusId as IStatus,
    priority: ticket.priorityId as IPriority,
    project: ticket.projectId as IProjectBase,
    createdBy: ticket.createdById as IAppUser,
    updatedBy: ticket.updatedById as IAppUser
  } as ITicketDetails;
  return projectDetails;
}

export const appUserAttributes = ["fullname", "firstname", "lastname", "userId", "image", "email", "-_id"];
export const projectBaseAttributes = ["projectId", "name", "identifier", "-_id"];
export const statusAttributes = ["statusId", "name", "isDefault", "icon", "color", "isDone", "-_id"];
export const priorityAttributes = ["priorityId", "name", "isDefault", "icon", "color", "-_id"];

export function castUserDocumentToDetails(user: IAppUserDocument) {
  const userDetails: IAppUser = {
    userId: user.id || user._id.toString(),
    email: user.email,
    fullname: user.fullname,
    firstname: user.firstname,
    lastname: user.lastname,
    image: user.image,
  }
  return userDetails;
}

export function castTransactionDocumentToDetails(transaction: ITransactionDocument) {
  const transactionDetails: ITransactionDetails = {
    transactionId: transaction.id || transaction._id.toString(),
    transactionType: transaction.transactionType,
    entityDetails: {
      name: (transaction.entityId as ITransactionEntityDetails).name,
      id: (transaction.entityId as ITransactionEntityDetails).id || ''
    },
    entityType: transaction.entityType,
    fields: transaction.fields,
    user: transaction.userId as IAppUser,
    createdAt: transaction.createdAt.toString(),
    updatedAt: transaction.updatedAt.toString()
  }
  return transactionDetails;
}

export function castStatusDocumentToDetails(status: IStatusDocument) {
  const statusDetails: IStatus = {
    statusId: status.id || status._id.toString(),
    name: status.name,
    icon: status.icon,
    color: status.color,
    isDone: status.isDone,
    isDefault: status.isDefault,
  }
  return statusDetails;
}

export function castPriorityDocumentToDetails(status: IPriorityDocument) {
  const statusDetails: IPriority = {
    priorityId: status.id || status._id.toString(),
    name: status.name,
    icon: status.icon,
    color: status.color,
    isDefault: status.isDefault,
  }
  return statusDetails;
}

export function generateRandomCharString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}


export function generateRandomNumberString(length: number): string {
  const characters = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function diffObjects<T extends Record<string, any>>(obj1: T, obj2: T): ITransactionField<Partial<ITransactionValues>> {
  const fields: ITransactionField<Partial<ITransactionValues>> = {};

  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  for (const key of allKeys) {
    const val1 = obj1[key as keyof T];
    const val2 = obj2[key as keyof T];
    const fieldKey = key as keyof ITransactionValues
    const isEqual = JSON.stringify(val1) === JSON.stringify(val2); // deep comparison

    if (!isEqual) {
      fields[fieldKey] = {
        oldValue: val1,
        newValue: val2
      }
    }
  }

  return fields;
}

export function differenceForTicket(previousVal: ITicketDocument, update: ITicketDocument) {
  console.log('diff FN', previousVal, update)
  const diff = diffObjects({
    name: previousVal.name,
    description: previousVal.description,
    statusId: previousVal.statusId,
    priorityId: previousVal.priorityId,
    assigneeIds: previousVal.assigneeIds
  }, {
    name: update.name,
    description: update.description,
    statusId: update.statusId,
    priorityId: update.priorityId,
    assigneeIds: update.assigneeIds
  });
  return diff;
}


export type UserDiff = {
  added: IAppUser[];
  removed: IAppUser[];
  changeType: 'added' | 'removed' | 'both' | 'none';
};

export function diffAssignees(oldList: IAppUser[], newList: IAppUser[]): UserDiff {
  const oldMap = new Map(oldList.map((a) => [a.userId, a]));
  const newMap = new Map(newList.map((a) => [a.userId, a]));

  const added = newList.filter((a) => !oldMap.has(a.userId));
  const removed = oldList.filter((a) => !newMap.has(a.userId));

  let changeType: UserDiff['changeType'] = 'none';
  if (added.length > 0 && removed.length > 0) {
    changeType = 'both';
  } else if (added.length > 0) {
    changeType = 'added';
  } else if (removed.length > 0) {
    changeType = 'removed';
  }

  return { added, removed, changeType };
}

export function formatDate(date: Date) {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return `${date.toLocaleTimeString()} ${monthNames[monthIndex]} ${day}, ${year}`;
}

