import PDFDocument from "pdfkit";
import { QuotationHeader } from "../entity/QuotationHeader";
import { ReceiptHeader } from "../entity/ReceiptHeader";
import { AppDataSource } from "../data-source";
import { Setting } from "../entity/Setting";

const getCurrency = async () => {
  const settingRepo = AppDataSource.getRepository(Setting);
  const setting = await settingRepo.findOneBy({ key: "currency" });
  return setting?.value || "LKR";
};

const formatPdfCurrency = (amount: number | string, currency: string) => {
  const val = Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (currency === "LKR") return `Rs. ${val}`;
  if (currency === "USD") return `$${val}`;
  return `${currency} ${val}`;
};

export const generateQuotationPDF = async (quotation: QuotationHeader): Promise<Buffer> => {
  return new Promise(async (resolve) => {
    const currency = await getCurrency();
    const doc = new PDFDocument({ margin: 50 });
    const buffers: any[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    // Header
    doc.fontSize(20).text(process.env.SHOP_NAME || "Jewellery Shop", { align: "center" });
    doc.fontSize(10).text("OFFICIAL QUOTATION", { align: "center" }).moveDown();

    // Info
    doc.fontSize(12).text(`Quotation No: Q-${quotation.quotationNo.toString().padStart(5, '0')}`);
    doc.text(`Date: ${quotation.quotationDate.toLocaleDateString()}`);
    doc.text(`Customer: ${quotation.customerName}`).moveDown();

    // Table Header
    const tableTop = 200;
    doc.fontSize(10).text("Item Code", 50, tableTop);
    doc.text("Description", 120, tableTop);
    doc.text("Qty", 350, tableTop);
    doc.text(`Total (${currency})`, 450, tableTop, { align: 'right', width: 100 });
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Line Items
    let y = tableTop + 25;
    quotation.details?.forEach((item) => {
      doc.text(item.itemCode || "-", 50, y);
      doc.text(item.itemDescription || "-", 120, y, { width: 220 });
      doc.text(item.quantity.toString(), 350, y);
      const amount = currency === 'LKR' ? item.lineTotalLkr : item.lineTotalUsd;
      doc.text(formatPdfCurrency(amount, currency), 450, y, { align: 'right', width: 100 });
      y += 25;
    });

    // Grand Totals
    doc.moveTo(50, y).lineTo(550, y).stroke();
    doc.fontSize(12).font('Helvetica-Bold').text("GRAND TOTAL:", 300, y + 20);
    const totalAmount = currency === 'LKR' ? quotation.totalLkr : quotation.totalUsd;
    doc.text(formatPdfCurrency(totalAmount, currency), 450, y + 20, { align: 'right', width: 100 });

    doc.end();
  });
};

export const generateReceiptPDF = async (receipt: ReceiptHeader): Promise<Buffer> => {
  return new Promise(async (resolve) => {
    const currency = await getCurrency();
    const doc = new PDFDocument({ margin: 50 });
    const buffers: any[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    // Header
    doc.fontSize(20).text(process.env.SHOP_NAME || "Jewellery Shop", { align: "center" });
    doc.fontSize(10).text("OFFICIAL PAYMENT RECEIPT", { align: "center" }).moveDown();

    // Info
    doc.fontSize(12).text(`Receipt No: R-${receipt.receiptNo.toString().padStart(5, '0')}`);
    doc.text(`Date: ${receipt.receiptDate.toLocaleDateString()}`);
    doc.text(`Customer: ${receipt.customerName}`);
    doc.text(`Payment Method: ${receipt.paymentMethod}`).moveDown();

    // Table Header
    const tableTop = 200;
    doc.fontSize(10).text("Item Code", 50, tableTop);
    doc.text("Description", 120, tableTop);
    doc.text("Qty", 350, tableTop);
    doc.text(`Price (${currency})`, 450, tableTop, { align: 'right', width: 100 });
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Line Items
    let y = tableTop + 25;
    receipt.details?.forEach((item) => {
      doc.text(item.itemCode || "-", 50, y);
      doc.text(item.itemDescription || "-", 120, y, { width: 220 });
      doc.text(item.quantity.toString(), 350, y);
      const amount = currency === 'LKR' ? item.lineTotalLkr : item.lineTotalUsd;
      doc.text(formatPdfCurrency(amount, currency), 450, y, { align: 'right', width: 100 });
      y += 25;
    });

    // Totals
    doc.moveTo(50, y).lineTo(550, y).stroke();
    doc.fontSize(12).font('Helvetica-Bold').text("TOTAL PAID:", 300, y + 20);
    const totalPaid = currency === 'LKR' ? receipt.totalPaidLkr : receipt.totalPaidUsd;
    doc.text(formatPdfCurrency(totalPaid, currency), 450, y + 20, { align: 'right', width: 100 });

    // Paid Stamp
    y += 80;
    doc.fontSize(40).fillColor('green').opacity(0.3).text("PAID", 0, y, { align: 'center' });

    doc.end();
  });
};
