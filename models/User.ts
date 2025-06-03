import mongoose, { Model, ObjectId, Schema } from "mongoose";
import { AppTimeStamp } from "./time-stamp";

export interface IAppUser {
    userId: string;
    fullname: string;
    firstname: string;
    lastname?: string;
    email: string;
    image?: string;
}

// Merging ITodo interface with mongoose's Document interface to create 
// a new interface that represents a todo document in MongoDB
export interface IAppUserDocument extends IAppUser, Document, AppTimeStamp {
    _id: ObjectId;
    id: string;
}


const UserSchema = new Schema<IAppUserDocument>(
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            auto: true,
        },
        userId: {
            type: String  // will be auto populated in pre save
        },
        email: {
            type: String,
            required: true
        },
        fullname: {
            type: String,
            required: true
        },
        firstname: {
            type: String,
            default: ''
        },
        lastname: {
            type: String,
            default: ''
        },
        image: {
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
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  }
});

UserSchema.pre('save', async function (next) {
    const doc = this;
    doc.userId = this.id;
    next();
})

// const AppUser : Model<IAppUserDocument> = process.env.NODE_ENV === 'development'
// ? mongoose.model('AppUser', UserSchema)
// : mongoose.models?.AppUser || mongoose.model('AppUser', UserSchema);

export const AppUser : Model<IAppUserDocument> = mongoose.models?.AppUser || mongoose.model('AppUser', UserSchema);
// export default AppUser;