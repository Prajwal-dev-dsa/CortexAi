import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (buffer, filename, resourceType = "auto") => {
    return new Promise((resolve, reject) => {
        const publicId = resourceType === "raw" ? filename : filename.replace(/\.[^/.]+$/, "");

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: resourceType,
                folder: "cortex_ai",
                public_id: publicId,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};