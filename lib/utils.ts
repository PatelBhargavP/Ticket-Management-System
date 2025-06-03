import { IProjectDetails, IProjectDocument, IProjectMember } from "@/models/Project";
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
    members: project.memberIds as IProjectMember[]
  } as IProjectDetails;
  return projectDetails;
}

export const projectMembersAttribute = ["fullname", "firstname", "lastname", "userId", "-_id"];

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