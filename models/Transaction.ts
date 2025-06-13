import mongoose, { CallbackError, Model, ObjectId, Schema, Types } from "mongoose";
import { AppUser, IAppUser, IAppUserDocument } from "./User";
import { AppTimeStamp } from "./time-stamp";
import { Project, IProjectBase, IProjectDocument } from "./Project";
import { IStatus } from "./Status";
import { IPriority } from "./Priority";



export type ITransactionValues = {
    name: string;
    description: string;
    assigneeIds: IAppUser[];
    statusId: IStatus;
    priorityId: IPriority;
}

export type ITransactionValueTypes = keyof ITransactionValues;
export type ITransactionTypes = 'create' | 'update';
export type ITransactionEntityTypes = 'Project' | 'Ticket';

// Generic interface where T must be a valid key of ITransactionValues
export type ITransactionField<T> = {
    [K in keyof T]: {
        oldValue: T[K];
        newValue: T[K];
    }
}

export interface ITransactionEntityDetails {
    name: string;
    id: string;
}

export interface ITransactionBase {
    transactionId: string;
    transactionType: ITransactionTypes;
    entityType: ITransactionEntityTypes;
    fields: ITransactionField<Partial<ITransactionValues>>;
}

export interface ITransactionDetails extends ITransactionBase, AppTimeStamp {
    user: IAppUser;
    entityDetails: ITransactionEntityDetails;
}

export interface ITransaction extends ITransactionBase {
    userId: ObjectId | string | IAppUser;
    entityId: ITransactionEntityDetails | string;
}

export interface ITransactionDocument extends ITransaction, AppTimeStamp, Document {
    _id: ObjectId;
    id: string;
}

const TransactionSchema = new Schema<ITransactionDocument>(
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            auto: true,
        },
        transactionId: {
            type: String
        },
        transactionType: {
            type: String,
            required: true
        },
        entityType: {
            type: String,
            enum: ['Ticket', 'Project'],
            required: true,
            default: 'Ticket'
        },
        entityId: {
            type: String,
            required: true,
            refPath: 'entityType'
        },
        fields: {
            type: Schema.Types.Map,
            of: {
                _id: false,
                oldValue: {
                    type: Schema.Types.Mixed,
                    required: true
                },
                newValue: {
                    type: Schema.Types.Mixed,
                    required: true
                }
            }
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: AppUser.modelName,
            required: true
        }
    },
    {
        // Automatically add 'createdAt' and 'updatedAt' fields to the document
        timestamps: true,
    }
);
// Automatically convert `_id` to `id`
TransactionSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
    }
});


TransactionSchema.pre('save', async function (next) {
    const doc = this;
    doc.transactionId = this.id;
    console.log("pre save function: ", doc);
    next();
});

export const Transaction: Model<ITransactionDocument> = mongoose.models?.Transaction || mongoose.model('Transaction', TransactionSchema);
// export default Project;