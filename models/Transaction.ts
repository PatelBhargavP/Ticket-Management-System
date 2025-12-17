import mongoose, { Model, ObjectId, Schema } from "mongoose";
import { AppUser, IAppUser } from "./User";
import { AppTimeStamp } from "./time-stamp";
import { IStatus } from "./Status";
import { IPriority } from "./Priority";
import { Project } from "./Project";
import { Ticket } from "./Ticket";



export type ITransactionValues = {
    name: string;
    description: string;
    assigneeIds: IAppUser[];
    statusId: IStatus;
    priorityId: IPriority;
}

const projectBaseName = Project.baseModelName;
const ticketBaseName = Ticket.baseModelName;

export type ITransactionValueTypes = keyof ITransactionValues;
export type ITransactionTypes = 'create' | 'update';
export type ITransactionEntityTypes =  'Project' | 'Ticket';

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
    transform: (_, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
    }
});


TransactionSchema.pre('save', async function () {
    const doc = this;
    // Use _id.toString() since id is a virtual property that may not be available during pre-save
    doc.transactionId = this._id.toString();
});

export const Transaction: Model<ITransactionDocument> = mongoose.models?.Transaction || mongoose.model('Transaction', TransactionSchema);
// export default Project;