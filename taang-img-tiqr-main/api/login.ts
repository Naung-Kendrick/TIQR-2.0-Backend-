import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import Redis from 'ioredis';

const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { username, password, device_id } = req.body;

    if (!device_id) {
        return res.status(400).json({
            success: false,
            message: 'Device identification missing. Please refresh and try again.'
        });
    }

    if (!redis) {
        console.error('Redis connection string missing (REDIS_URL)');
        return res.status(500).json({
            success: false,
            message: 'Internal server error: Database connection not configured.'
        });
    }

    try {
        const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
        const DEVICE_PREFIX = 'device:';
        const DEVICE_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

        // Defined authorized users from env variables
        const users = [
            { u: process.env.ADMIN_USERNAME, p: process.env.ADMIN_PASSWORD, role: 'admin' },
            { u: process.env.NAMHSAN_USER, p: process.env.NAMHSAN_PASSWORD, role: 'Namhsan' },
            { u: process.env.NAMTU_USER, p: process.env.NAMTU_PASSWORD, role: 'Namtu' },
            { u: process.env.MANTON_USER, p: process.env.MANTON_PASSWORD, role: 'Manton' },
            { u: process.env.NAMKHAM_USER, p: process.env.NAMKHAM_PASSWORD, role: 'Namkham' },
            { u: process.env.KUTKAI_USER, p: process.env.KUTKAI_PASSWORD, role: 'Kutkai' },
            { u: process.env.BORDER_USER, p: process.env.BORDER_PASSWORD, role: 'Border' },
            { u: process.env.MONGWEE_USER, p: process.env.MONGWEE_PASSWORD, role: 'Mongwee' }
        ];

        // Find if the credentials match any user (check FIRST, before device registration)
        const userFound = users.find(user =>
            user.u && user.p && username === user.u && password === user.p
        );

        if (!userFound) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // --- Device Limit Logic (only runs AFTER successful credential check) ---
        const deviceKey = `${DEVICE_PREFIX}${device_id}`;

        // Check if this device is already registered (and still active)
        const isRegistered = await redis.exists(deviceKey);

        if (!isRegistered) {
            // Count all active device keys
            const allDeviceKeys = await redis.keys(`${DEVICE_PREFIX}*`);
            const deviceCount = allDeviceKeys.length;

            if (deviceCount >= 50) {
                return res.status(403).json({
                    success: false,
                    message: 'Device Limit Reached (Max 50). Please contact admin.'
                });
            }
        }

        // Register/refresh device with 30-day TTL (auto-expires inactive devices)
        await redis.set(deviceKey, username, 'EX', DEVICE_TTL);

        // Generate token valid for 4 days
        const token = jwt.sign(
            { username, role: userFound.role },
            JWT_SECRET,
            { expiresIn: '4d' }
        );

        return res.status(200).json({
            success: true,
            token,
            role: userFound.role,
            message: 'Authentication successful'
        });
    } catch (error) {
        console.error('KV/Auth Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.'
        });
    }
}
