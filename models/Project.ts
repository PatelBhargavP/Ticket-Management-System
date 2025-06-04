import mongoose, { CallbackError, Model, ObjectId, Schema, Types } from "mongoose";
import { AppUser, IAppUser, IAppUserDocument } from "./User";
import { AppTimeStamp } from "./time-stamp";

export interface IProjectBase {
    projectId: string;
    name: string;
    identifier?: string;
}


export interface IProjectDetails extends IProjectBase, AppTimeStamp {
    members: IAppUser[];
}

export interface IProject extends IProjectBase, AppTimeStamp {
    memberIds: Types.ObjectId[] | IAppUserDocument[] | string[];
    taskIds: string[];
}

// Merging ITodo interface with mongoose's Document interface to create 
// a new interface that represents a todo document in MongoDB
export interface IProjectDocument extends IProject, Document {
    _id: ObjectId;
    id: string;
}


const ProjectSchema = new Schema<IProjectDocument>(
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            auto: true,
        },
        projectId: {
            type: String  // will be auto populated in pre save
        },
        name: {
            type: String,
            required: true
        },
        memberIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: AppUser.modelName
        }],
        taskIds: [{
            type: String
        }],
        identifier: {
            type: String,
            default: ''
        }
    },
    {
        // Automatically add 'createdAt' and 'updatedAt' fields to the document
        timestamps: true,
    }
);
// Automatically convert `_id` to `id`
ProjectSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  }
});

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

ProjectSchema.pre('save', async function (next) {
    const doc = this;
    doc.projectId = this.id;
    console.log("pre save function: ", doc);
    // const existingUser = await (this.constructor as Model<Project>).findOne({ identifier: randomString });
    // if (existingUser) {
    //   return next(new Error('Name already exists'));
    // }
    if (!doc.identifier) {
        let randomString = '';
        let checkCount = 1;
        let isUnique = false
        do {
            randomString = checkCount < 100 && doc.name.length > 3
            ? `${doc.name.substring(0, 3)}-${checkCount}` : `${generateRandomCharString(3)}-${checkCount}`; // Generate a unique identifier
            checkCount = checkCount < 100 ? checkCount + 1 : 1;
            try {
                // Attempt to find a document with the same customId
                const existingProject = await (this.constructor as Model<IProjectDocument>).findOne({
                    identifier: { $regex: randomString, $options: 'i' }
                });

                if (!existingProject) {
                    isUnique = true; // Identifier is unique, exit loop
                }
            } catch (error) {
                if (error instanceof Error) {
                    // Now 'error' is typed as Error
                    console.error("Error message:", error.message);
                } else {
                    // Handle cases where error is not an Error object
                    console.error("An unknown error occurred:", error);
                }
            }
        }
        while (!isUnique)
        doc.identifier = randomString.toLocaleUpperCase();
    }
    next();
});

export const Project: Model<IProjectDocument> = mongoose.models?.Project || mongoose.model('Project', ProjectSchema);
// export default Project;