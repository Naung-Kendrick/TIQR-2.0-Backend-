import mongoose from "mongoose"

const connectDB = async (dbUrl: string) => {
    try {
        const data = await mongoose.connect(dbUrl);
        const host = data.connection.host;
        console.log(`Database is connected with ${host}`);
    } catch (error) {
        if (error instanceof Error) {
            console.log("db error >>>", error.message);
            setTimeout(() => connectDB(dbUrl), 5000);
        }
    }
}

export default connectDB;