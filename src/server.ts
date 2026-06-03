import express, { NextFunction, Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import { ErrorMiddleware } from "./middlewares/error";
import connectDB from "./config/db";
import rateLimit from "express-rate-limit";
import http from "http";
import { Server } from "socket.io";

import userRouter from "./routes/user.route";

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
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
        credentials: true
    }
});

// Map to store connected user sessions: userId -> socketId
const userSockets = new Map<string, string>();

io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("register", (userId: string) => {
        if (userId) {
            userSockets.set(userId, socket.id);
            console.log(`User registered on socket: ${userId} -> ${socket.id}`);
        }
    });

    socket.on("webcam-request", ({ targetUserId, requesterId, requesterName }: { targetUserId: string; requesterId: string; requesterName: string }) => {
        const targetSocketId = userSockets.get(targetUserId);
        console.log(`Webcam request from ${requesterName} (${requesterId}) to user ${targetUserId} (socket: ${targetSocketId})`);
        if (targetSocketId) {
            io.to(targetSocketId).emit("webcam-request", { requesterId, requesterName });
        } else {
            socket.emit("webcam-error", { message: "Target user is currently unreachable/offline for streaming." });
        }
    });

    socket.on("webcam-offer", ({ targetUserId, offer }: { targetUserId: string; offer: any }) => {
        const targetSocketId = userSockets.get(targetUserId);
        console.log(`Sending SDP offer to ${targetUserId} (socket: ${targetSocketId})`);
        if (targetSocketId) {
            io.to(targetSocketId).emit("webcam-offer", { offer, senderId: socket.id });
        }
    });

    socket.on("webcam-answer", ({ targetUserId, answer }: { targetUserId: string; answer: any }) => {
        const targetSocketId = userSockets.get(targetUserId);
        console.log(`Sending SDP answer to ${targetUserId} (socket: ${targetSocketId})`);
        if (targetSocketId) {
            io.to(targetSocketId).emit("webcam-answer", { answer });
        }
    });

    socket.on("ice-candidate", ({ targetUserId, candidate }: { targetUserId: string; candidate: any }) => {
        const targetSocketId = userSockets.get(targetUserId);
        if (targetSocketId) {
            io.to(targetSocketId).emit("ice-candidate", { candidate });
        }
    });

    socket.on("webcam-close", ({ targetUserId }: { targetUserId: string }) => {
        const targetSocketId = userSockets.get(targetUserId);
        if (targetSocketId) {
            io.to(targetSocketId).emit("webcam-close");
        }
    });

    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
        for (const [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                console.log(`Removed user session: ${userId}`);
                break;
            }
        }
    });
});

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

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    connectDB(dbUrl);
});

app.use(ErrorMiddleware);
