import mongoose, { Model, ObjectId, Schema } from "mongoose";
import { AppTimeStamp } from "./time-stamp";

export interface IPriority {
    priorityId: string;
    name: string;
    icon?: string;
    color?: string;
    isDefault?: boolean;
}

// Merging ITodo interface with mongoose's Document interface to create 
// a new interface that represents a todo document in MongoDB
export interface IPriorityDocument extends IPriority, Document, AppTimeStamp {
    _id: ObjectId;
    id: string;
}


const PrioritySchema = new Schema<IPriorityDocument>(
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            auto: true,
        },
        priorityId: {
            type: String  // will be auto populated in pre save
        },
        name: {
            type: String,
            required: true
        },
        color: {
            type: String,
            default: ''
        },
        icon: {
            type: String,
            default: ''
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    },
    {
        // Automatically add 'createdAt' and 'updatedAt' fields to the document
        timestamps: true,
    }
);

// Automatically convert `_id` to `id`
PrioritySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    ret.priorityId = ret._id;
    delete ret._id;
  }
});

PrioritySchema.pre('save', async function () {
    const doc = this;
    // Use _id.toString() since id is a virtual property that may not be available during pre-save
    doc.priorityId = this._id.toString();
})

export const Priority : Model<IPriorityDocument> = mongoose.models?.Priority || mongoose.model('Priority', PrioritySchema);
