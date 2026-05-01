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
app.use(cors({ origin: "*" }));
app.use(limiter);

const port = process.env.PORT || 3000;
const dbUrl = process.env.DB_URL || "";

app.get("/", (req: Request, res: Response) => {
    res.status(200).send("<h1>Expense Api is working...</h1>");
});

app.use('/users', userRouter);

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
