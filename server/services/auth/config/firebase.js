import { cert, initializeApp } from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath =
    process.env.NODE_ENV === "production"
        ? "/etc/secrets/serviceAccountKey.json"
        : path.join(__dirname, "../serviceAccountKey.json");

const serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, "utf-8")
);

export const app = initializeApp({
    credential: cert(serviceAccount)
});