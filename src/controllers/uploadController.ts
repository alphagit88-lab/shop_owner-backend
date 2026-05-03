import { Request, Response } from "express";
import { uploadToBlob } from "../services/storageService";

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { folder = "uploads" } = req.body;
    const fileName = `${folder}/${Date.now()}-${req.file.originalname}`;
    
    const url = await uploadToBlob(req.file, fileName);

    res.json({ url });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
