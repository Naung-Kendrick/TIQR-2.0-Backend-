import multer from "multer";
import { bucket, region, s3 } from "../config/s3";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

// 1 byte = 8 bits
// 1kb = 1024 bytes
// 1mb = 1024 kb
// 1g = 1024 mb

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    }
});

export const uploadFile = async (file: any) => {
    const key = `uploads/${Date.now()}-${file.originalname}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        })
    );
    const location = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return location;
}

export const deleteFile = async (fileUrl: string) => {
    const key = fileUrl.split("amazonaws.com/")[1];
    await s3.send(
        new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        })
    )
}