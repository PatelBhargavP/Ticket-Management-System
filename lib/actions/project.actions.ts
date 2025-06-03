// "use server";

// import { Project } from "@/models";
// import { IProjectDetails, IProjectDocument, IProjectMember } from "@/models/Project";
// import { FilterQuery } from "mongoose";
// import dbConnect from "../db";
// import { authOptions } from "@/auth";
// import { getServerSession } from "next-auth";
// import { revalidatePath, revalidateTag } from "next/cache";
// import util from 'util'

// export async function getUserProjects(userId: string, caller?: string) {
//     try {
//         await dbConnect();
//         const filters = {} as FilterQuery<IProjectDocument>;
//         if (userId) {
//             filters.memberIds = { $in: [userId] }
//         }
//         const projects = await Project.find(filters).populate('memberIds', ["fullname", "firstname", "lastname", "userId", "-_id"]).lean();
//         console.log('get projects list value: ', projects[1]?.name, ', by : ' + caller)
//         return projects.map(project => ({
//             projectId: project.projectId,
//             name: project.name,
//             identifier: project.identifier,
//             createdAt: project.createdAt,
//             updatedAt: project.updatedAt,
//             members: project.memberIds as IProjectMember[]
//         } as IProjectDetails));
//     }
//     catch (error) {
//         console.error('Error fetching user project list:', error);
//         throw Error('Failed to process fetch project list request');
//     }
// }



// export async function createProject(data: Partial<IProjectDocument>) {
//     try {
//         const session = await getServerSession(authOptions);
//         await dbConnect();
//         if (!data.name) {
//             throw Error('Cannot create project without name');
//         } else {
//             if (session?.userId) {
//                 data['memberIds'] = [session.userId];
//             }
//             const project = await Project.create(data);
//             const createdProject =  await getProjectDetails({ identifier: project?.identifier });
//             revalidatePath('/projects');
//             return createdProject
//         }

//     } catch (error) {
//         console.error('Error processing create project request:', error);
//         throw Error('Failed to process create project request');
//     }
// }

// export async function updateProject(projectId: string, data: Partial<IProjectDocument>) {
//     try {
//         console.log('Payload:', util.inspect(data, { depth: null }))
//         await dbConnect();
//         let project: IProjectDocument | null;
//         if (!projectId) {
//             throw Error('Cannot find project without id');
//         }
//         project = await Project.findById(projectId);
//         if (!project) {
//             throw Error('Could not find project with ID ' + projectId);
//         } else {
//             const payload: Partial<IProjectDocument> = {};
//             if (data.name) {
//                 payload.name = data.name
//             }
//             if (data.memberIds) {
//                 payload.memberIds = data.memberIds
//             }
//             const resData = await Project.updateOne({ _id: projectId }, {$set: payload });
//             const updatedProject = await getProjectDetails({ projectId });
//             console.log('Updated project name: ', updatedProject, resData.acknowledged);
//             revalidatePath('/projects');
//             return updatedProject;
//         }
//     } catch (error) {
// //   console.error('Update error:\n', util.inspect(error, { depth: null }))
//   if (error instanceof Error) {
//     throw new Error(`Failed to update project: ${error.message}`)
//   } else {
//     throw new Error('Unknown error occurred during project update')
//   }
//         // console.error('Error processing update request:', error);
//         throw new Error('Failed to process update request');
//     }
// }

// export async function getProjectDetails(filter: FilterQuery<IProjectDocument>) {
//     try {
//         await dbConnect();
//         const project = await Project.findOne(filter)
//             .populate('memberIds', ["id", "fullname", "firstname", "lastname"]);

//         if (!project) {
//             throw Error('Project not found');
//         }
//         const projectDetails: IProjectDetails = {
//             projectId: project.id,
//             name: project.name,
//             createdAt: project.createdAt,
//             updatedAt: project.updatedAt,
//             identifier: project.identifier,
//             members: project.memberIds as unknown as IProjectMember[]
//         }
//         return projectDetails;

//     } catch (error) {
//         console.error('Error fetching user:', error);
//         throw Error('Failed to process get request');
//     }
// }