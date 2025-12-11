import mongoose, { Model, ObjectId, Schema } from "mongoose";
import { AppTimeStamp } from "./time-stamp";

export interface IKanbanColumnOrder {
    identifier: string;
    entityOrder: string[];
}

// Merging ITodo interface with mongoose's Document interface to create 
// a new interface that represents a todo document in MongoDB
export interface IKanbanColumnOrderDocument extends IKanbanColumnOrder, Document, AppTimeStamp {
    _id: ObjectId;
    id: string;
}


const KanbanColumnOrderSchema = new Schema<IKanbanColumnOrderDocument>(
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            auto: true,
        },
        identifier: {
            type: String,  // will be auto populated in pre save
            require: true
        },
        entityOrder: [{
            type: String,
            default: []
        }]
    },
    {
        // Automatically add 'createdAt' and 'updatedAt' fields to the document
        timestamps: true,
    }
);

// Automatically convert `_id` to `id`
KanbanColumnOrderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

export const KanbanColumnOrder : Model<IKanbanColumnOrderDocument> = mongoose.models?.KanbanColumnOrder || mongoose.model('KanbanColumnOrder', KanbanColumnOrderSchema);
