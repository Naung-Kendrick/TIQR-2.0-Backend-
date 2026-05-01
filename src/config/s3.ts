import { S3Client } from "@aws-sdk/client-s3";
import "dotenv/config";

export const region = process.env.AWS_S3_REGION;
export const bucket = process.env.AWS_S3_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing AWS S3 configuration environment variables")
}

export const s3 = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    }
});