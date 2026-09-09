import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { awsS3 } from "../config/aws.s3.js";

export const fetchFromS3 = async (filename) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: filename,
    });
    return await getSignedUrl(awsS3, command, { expiresIn: 3600 });
};