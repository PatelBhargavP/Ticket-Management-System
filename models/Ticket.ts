import mongoose, { CallbackError, Model, ObjectId, Schema, Types } from "mongoose";
import { AppUser, IAppUser, IAppUserDocument } from "./User";
import { AppTimeStamp } from "./time-stamp";
import { Project, IProjectBase, IProjectDocument } from "./Project";
import { IStatus, Status } from "./Status";
import { IPriority, Priority } from "./Priority";
import { statuses } from "@/lib/status.data";

export interface ITicketBase {
    ticketId: string;
    name: string;
    description: string;
    identifier?: string;
}


export interface ITicketDetails extends ITicketBase, AppTimeStamp {
    assignee: IAppUser[];
    project: IProjectBase;
    status: IStatus;
    priority: IPriority;
}

export interface ITicket extends ITicketBase, AppTimeStamp {
    assigneeIds: Types.ObjectId[] | IAppUserDocument[] | string[];
    projectId: Types.ObjectId | IProjectDocument | string;
    statusId: Types.ObjectId | IStatus | string;
    priorityId: Types.ObjectId | IPriority | string;
    taskPrefix: string;
}

export interface ITicketDocument extends ITicket, Document {
    _id: ObjectId;
    id: string;
}


const TicketSchema = new Schema<ITicketDocument>(
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            auto: true,
        },
        ticketId: {
            type: String  // will be auto populated in pre save
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ''
        },
        assigneeIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: AppUser.modelName
        }],
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Project.modelName,
            require: true
        },
        statusId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Status.modelName,
            require: true,
            // default: async function () {
            //     const defaultStatus = await Status.findOne({ isDefault: true }).sort({ createdAt: 1 }).lean();
            //     if (defaultStatus) {
            //         return defaultStatus._id;
            //     } else {
            //         const newStatus = await Status.create(statuses[0]);
            //         return newStatus?._id;
            //     }
            // }
        },
        priorityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Priority.modelName,
            require: true
        },
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
TicketSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
    }
});


TicketSchema.pre('save', async function (next) {
    const doc = this;
    doc.ticketId = this.id;
    console.log("pre save function: ", doc);
    if (!doc.identifier) {
        let randomString = '';
        let taskCount = await (await (this.constructor as Model<ITicketDocument>).find()).length;
        let isUnique = false
        const projectDetails = await (this.constructor as Model<IProjectDocument>).findOne({ projectId: doc.projectId });
        do {
            randomString = `${projectDetails?.identifier}-${taskCount + 1}`;
            try {
                // Attempt to find a document with the same customId
                const existingProject = await (this.constructor as Model<ITicketDocument>).findOne({
                    identifier: { $regex: randomString, $options: 'i' }
                });

                if (!existingProject) {
                    isUnique = true; // Identifier is unique, exit loop
                }
                taskCount = taskCount + 1;
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

export const Ticket: Model<ITicketDocument> = mongoose.models?.Ticket || mongoose.model('Ticket', TicketSchema);
// export default Project;