// "use server";

// import { AppUser } from "@/models";
// import { IAppUser } from "@/models/User";
// import dbConnect from "../db";
// import { FilterQuery } from "mongoose";
// import { User } from "next-auth";
// import { converUserToAppUser } from "../utils";

// export async function getAppUsers() {
//   try {
//     await dbConnect();
//     const users = await AppUser.find().lean();
//     console.log("Fetched users from util", users.length)
//     return users.map(user => ({
//       userId: user.userId,
//       fullname: user.fullname,
//       firstname: user.firstname,
//       lastname: user.lastname,
//       email: user.email,
//       image: user.image,
//     } as IAppUser));
//   } catch (error) {
//     console.error('Error fetching users list:', error);
//     throw Error('Failed to process fetch users list request');
//   }
// }


// export async function createUser(user: User) {
//   try {
//     await dbConnect();
//     const payload = converUserToAppUser(user);

//     if(!payload.email) {
//       throw Error('Cannot create user without email');
//     }

//     await AppUser.create(payload);

//     console.log("cretate request: ", payload)
//     return await getUserDetails({ email: payload.email});
//   } catch (error) {
//     console.error('Error creating user:', error);
//     throw Error('Failed to process create users request');
//   }
// }

// export async function upsertUser(params: Partial<IAppUser>) {
//   try {
//     await dbConnect();
//     if (!params.email && !params.userId) {
//       return null
//     }
//     const filter: FilterQuery<IAppUser> = {};
//     if (params.userId) {
//       filter.userId = params.userId;
//     }
//     if (params.email) {
//       filter.email = params.email;
//     }
//     const existingUser = await getUserDetails(filter);

//     if (!existingUser) {
//       throw Error('Cannot find user');
//     } else {
//       await AppUser.findOneAndUpdate(filter, params, {
//         new: true
//       });
//     }
//     console.log("update request: ", filter,)
//     return await getUserDetails(filter);
//   } catch (error) {
//     console.error('Error upserting user:', error);
//     throw Error('Failed to process upsert users request');
//   }
// }

// export async function getUserDetails(filter: FilterQuery<IAppUser>) {
//   try {

//     await dbConnect();
//     const user = await AppUser.findOne(filter);
//     console.log("get request: ", filter, user)

//     if (!user) {
//       return null;
//     }

//     const userDetails: IAppUser = {
//       userId: user.id,
//       email: user.email,
//       fullname: user.fullname,
//       firstname: user.firstname,
//       lastname: user.lastname,
//       image: user.image,
//     }
//     return userDetails;
//   } catch (error) {
//     console.error('Error getting user:', error);
//     throw Error('Failed to process get user request');
//   }
// }