import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { ReceiptHeader } from "../entity/ReceiptHeader";
import { generateReceiptPDF } from "../services/pdfService";
import { sendEmailWithAttachment } from "../services/emailService";

const receiptRepo = AppDataSource.getRepository(ReceiptHeader);

export const getAllReceipts = async (req: Request, res: Response) => {
  try {
    const receipts = await receiptRepo.find({
      order: { receiptDate: "DESC" },
      relations: ["customer"]
    });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching receipts" });
  }
};

export const getReceipt = async (req: Request, res: Response) => {
  try {
    const no = req.params.no as string;
    const receipt = await receiptRepo.findOne({
      where: { receiptNo: parseInt(no) },
      relations: ["details", "customer"]
    });
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: "Error fetching receipt" });
  }
};

export const sendReceiptEmail = async (req: Request, res: Response) => {
  try {
    const no = req.params.no as string;
    const { email } = req.body;

    const receipt = await receiptRepo.findOne({
      where: { receiptNo: parseInt(no) }
    });

    if (!receipt) return res.status(404).json({ message: "Receipt not found" });

    const pdfBuffer = await generateReceiptPDF(receipt);
    await sendEmailWithAttachment(
      email,
      `Receipt #${receipt.receiptNo} from ${process.env.SHOP_NAME}`,
      "Thank you for your purchase. Please find your receipt attached.",
      `Receipt_${receipt.receiptNo}.pdf`,
      pdfBuffer
    );

    res.json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending email" });
  }
};
