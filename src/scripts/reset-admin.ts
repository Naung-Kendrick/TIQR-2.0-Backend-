import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { UserRole } from "../types/UserRole";

dotenv.config();

const resetAdmin = async () => {
    try {
        if (!process.env.DB_URL) {
            console.error("DB_URL is not defined in .env");
            process.exit(1);
        }
        
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB via direct connection");

        const email = "rootadmin@tiqr.com";
        const password = "adminpassword123";
        const hashedPassword = await bcrypt.hash(password, 10);

        const usersCollection = mongoose.connection.collection('users');

        // Delete existing if any
        await usersCollection.deleteOne({ email });

        await usersCollection.insertOne({
            name: "Root Administrator",
            email,
            password: hashedPassword,
            role: UserRole.ROOT_ADMIN,
            active: true,
            township: "Namhsan",
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log("-----------------------------------------");
        console.log("ROOT ADMIN RESET SUCCESSFUL (Direct DB)");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log("-----------------------------------------");
        
        process.exit(0);
    } catch (err) {
        console.error("Error resetting admin:", err);
        process.exit(1);
    }
};

resetAdmin();
