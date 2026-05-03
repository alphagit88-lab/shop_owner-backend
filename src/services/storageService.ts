import { put } from "@vercel/blob";
import dotenv from "dotenv";

dotenv.config();

export const uploadToBlob = async (file: Express.Multer.File, path: string) => {
  try {
    const { url } = await put(path, file.buffer, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return url;
  } catch (error) {
    console.error("Vercel Blob upload error:", error);
    throw new Error("Failed to upload file to storage");
  }
};
