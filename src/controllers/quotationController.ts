import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { QuotationHeader } from "../entity/QuotationHeader";
import { QuotationDetail } from "../entity/QuotationDetail";
import { Item } from "../entity/Item";
import { ReceiptHeader } from "../entity/ReceiptHeader";
import { ReceiptDetail } from "../entity/ReceiptDetail";
import { generateQuotationPDF } from "../services/pdfService";
import { sendEmailWithAttachment } from "../services/emailService";

const quotationRepo = AppDataSource.getRepository(QuotationHeader);
const itemRepo = AppDataSource.getRepository(Item);

export const createQuotation = async (req: Request, res: Response) => {
  try {
    const { customerId, customerName, details, notes } = req.body;

    // Create header
    const quotation = new QuotationHeader();
    quotation.customerId = customerId;
    quotation.customerName = customerName;
    quotation.notes = notes;
    quotation.details = [];

    let totalUsd = 0;
    let totalLkr = 0;

    // Create details
    for (const itemData of details) {
      const detail = new QuotationDetail();
      detail.itemId = itemData.itemId;
      detail.itemCode = itemData.itemCode;
      detail.itemDescription = itemData.itemDescription;
      detail.unitPriceUsd = itemData.unitPriceUsd;
      detail.unitPriceLkr = itemData.unitPriceLkr;
      detail.discountPct = itemData.discountPct || 0;
      detail.discountAmountUsd = itemData.discountAmountUsd || 0;
      detail.discountAmountLkr = itemData.discountAmountLkr || 0;
      detail.quantity = itemData.quantity || 1;

      // Calculate line totals
      detail.lineTotalUsd = (detail.unitPriceUsd - detail.discountAmountUsd) * detail.quantity;
      detail.lineTotalLkr = (detail.unitPriceLkr - detail.discountAmountLkr) * detail.quantity;

      totalUsd += Number(detail.lineTotalUsd);
      totalLkr += Number(detail.lineTotalLkr);

      quotation.details.push(detail);
    }

    quotation.totalUsd = totalUsd;
    quotation.totalLkr = totalLkr;

    await quotationRepo.save(quotation);
    res.status(201).json(quotation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating quotation" });
  }
};

export const getAllQuotations = async (req: Request, res: Response) => {
  try {
    const quotations = await quotationRepo.find({
      order: { quotationDate: "DESC" },
      relations: ["customer"]
    });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching quotations" });
  }
};

export const getQuotation = async (req: Request, res: Response) => {
  try {
    const { no } = req.params;
    const quotation = await quotationRepo.findOne({
      where: { quotationNo: parseInt(no) },
      relations: ["details", "customer"]
    });
    if (!quotation) return res.status(404).json({ message: "Quotation not found" });
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: "Error fetching quotation" });
  }
};

export const sendQuotationEmail = async (req: Request, res: Response) => {
  try {
    const { no } = req.params;
    const { email } = req.body;

    const quotation = await quotationRepo.findOne({
      where: { quotationNo: parseInt(no) },
      relations: ["details"]
    });

    if (!quotation) return res.status(404).json({ message: "Quotation not found" });

    const pdfBuffer = await generateQuotationPDF(quotation);
    await sendEmailWithAttachment(
      email,
      `Quotation #${quotation.quotationNo} from ${process.env.SHOP_NAME}`,
      "Please find your requested quotation attached.",
      `Quotation_${quotation.quotationNo}.pdf`,
      pdfBuffer
    );

    quotation.status = "SENT";
    await quotationRepo.save(quotation);

    res.json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending email" });
  }
};

export const convertToReceipt = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { no } = req.params;
    const { paymentMethod } = req.body;

    const quotation = await quotationRepo.findOne({
      where: { quotationNo: parseInt(no) },
      relations: ["details"]
    });

    if (!quotation) throw new Error("Quotation not found");
    if (quotation.status === "CONVERTED") throw new Error("Already paid");

    // 1. Create Receipt
    const receipt = new ReceiptHeader();
    receipt.quotationNo = quotation.quotationNo;
    receipt.customerId = quotation.customerId;
    receipt.customerName = quotation.customerName;
    receipt.paymentMethod = paymentMethod;
    receipt.totalPaidUsd = quotation.totalUsd;
    receipt.totalPaidLkr = quotation.totalLkr;
    receipt.details = [];

    for (const qd of quotation.details) {
      const rd = new ReceiptDetail();
      rd.quotationDetailId = qd.id;
      rd.itemId = qd.itemId;
      rd.itemCode = qd.itemCode;
      rd.itemDescription = qd.itemDescription;
      rd.unitPriceUsd = qd.unitPriceUsd;
      rd.unitPriceLkr = qd.unitPriceLkr;
      rd.discountPct = qd.discountPct;
      rd.discountAmountUsd = qd.discountAmountUsd;
      rd.discountAmountLkr = qd.discountAmountLkr;
      rd.quantity = qd.quantity;
      rd.lineTotalUsd = qd.lineTotalUsd;
      rd.lineTotalLkr = qd.lineTotalLkr;
      
      receipt.details.push(rd);

      // 2. Mark item as sold
      if (qd.itemId) {
        await queryRunner.manager.update(Item, qd.itemId, { isAvailable: false });
      }
    }

    await queryRunner.manager.save(receipt);

    // 3. Update Quotation Status
    quotation.status = "CONVERTED";
    await queryRunner.manager.save(quotation);

    await queryRunner.commitTransaction();
    res.status(201).json(receipt);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    res.status(500).json({ message: error.message || "Error converting to receipt" });
  } finally {
    await queryRunner.release();
  }
};
