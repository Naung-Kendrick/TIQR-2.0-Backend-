import express, { NextFunction, Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import { ErrorMiddleware } from "./middlewares/error";
import connectDB from "./config/db";
import rateLimit from "express-rate-limit";

import userRouter from "./routes/user.route";

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
});

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
        ];
        if (process.env.FRONTEND_URL) {
            allowedOrigins.push(process.env.FRONTEND_URL);
        }
        
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
}));
app.use(limiter);

const port = process.env.PORT || 3000;
const dbUrl = process.env.DB_URL || "";

app.get("/", (req: Request, res: Response) => {
    res.status(200).send("<h1>Expense Api is working...</h1>");
});

app.use('/api/users', userRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} is not found!`,
    })
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    connectDB(dbUrl);
});

app.use(ErrorMiddleware);
