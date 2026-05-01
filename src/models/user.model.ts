import { model, Schema, Document, Model } from "mongoose";
import { IUser } from "../types/IUser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Define instance methods interface
interface IUserMethods {
    signAccessToken(): string;
    comparePassword(enteredPassword: string): Promise<boolean>;
}

// Model type that uses the methods
type TUserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, TUserModel, IUserMethods>({
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        validate: {
            validator: function (value: string) {
                return emailRegexPattern.test(value);
            },
            message: "Please enter a valid email",
        }
    },
    phone: {
        type: String,
    },
    township: {
        type: String,
        enum: ["Namhsan Team", "Namkham Team", "Manton Team", "Namtu Team", "Namkham Border Team", "Mongwee Team", "Mongbow Team", "MongNgaw Team", "Kutkai Team"],
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minLength: [6, "Password must be at least 6 characters"],
        select: false,
    },
    avatar: {
        type: String,
    },
    role: {
        type: Number,
        default: 0,
    },
    active: {
        type: Boolean,
        default: false,
    },
    lastSeen: {
        type: Date,
    },
}, { timestamps: true });

userSchema.pre("save", async function (this: IUserDocument) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

userSchema.methods.signAccessToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_TOKEN_SECRET || "",
        { expiresIn: "7d" }
    );
};

userSchema.methods.comparePassword = async function (enterPassword: string) {
    return await bcrypt.compare(enterPassword, this.password);
};

// Exporting both the model and a helper type for documents with methods
export type IUserDocument = Document<unknown, {}, IUser> & IUser & IUserMethods;

const UserModel = model<IUser, TUserModel>("users", userSchema);
export default UserModel;