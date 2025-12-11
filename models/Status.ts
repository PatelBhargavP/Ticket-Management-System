import mongoose, { Model, ObjectId, Schema } from "mongoose";
import { AppTimeStamp } from "./time-stamp";

export interface IStatus {
    statusId: string;
    name: string;
    isDefault?: boolean;
    icon?: string;
    color?: string;
    isDone: boolean;
}

// Merging ITodo interface with mongoose's Document interface to create 
// a new interface that represents a todo document in MongoDB
export interface IStatusDocument extends IStatus, Document, AppTimeStamp {
    _id: ObjectId;
    id: string;
}


const StatusSchema = new Schema<IStatusDocument>(
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            auto: true,
        },
        statusId: {
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
        },
        isDone: {
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
StatusSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    ret.statusId = ret._id;
    delete ret._id;
  }
});

StatusSchema.pre('save', async function () {
    const doc = this;
    // Use _id.toString() since id is a virtual property that may not be available during pre-save
    doc.statusId = this._id.toString();
})

export const Status : Model<IStatusDocument> = mongoose.models?.Status || mongoose.model('Status', StatusSchema);
// export default AppUser;