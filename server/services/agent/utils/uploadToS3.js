import { PutObjectCommand } from "@aws-sdk/client-s3"
import { awsS3 } from "../config/aws.s3.js";


export const uploadToS3 = async (filename, buffer, contentType) => {
    await awsS3.send(
        new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: filename,
            Body: buffer,
            ContentType: contentType,
        })
    );
    return filename;
};