import { IPriority, IPriorityDocument } from "@/models/Priority";
import { IProjectBase, IProjectDetails, IProjectDocument } from "@/models/Project";
import { IStatus, IStatusDocument } from "@/models/Status";
import { ITicketDetails, ITicketDocument } from "@/models/Ticket";
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
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
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
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    assignee: ticket.assigneeIds as IAppUser[],
    status: ticket.statusId as IStatus,
    priority: ticket.priorityId as IPriority,
    project: ticket.projectId as IProjectBase
  } as ITicketDetails;
  return projectDetails;
}

export const appUserAttributes = ["fullname", "firstname", "lastname", "userId", "image", "email", "-_id"];
export const projectBaseAttributes = [ "projectId","name","identifier", "-_id"];
export const statusAttributes = [ "statusId","name","isDefault","icon","color","isDone", "-_id"];
export const priorityAttributes = [ "priorityId","name","isDefault","icon","color", "-_id"];

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