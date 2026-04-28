import PDFDocument from "pdfkit";
import { QuotationHeader } from "../entity/QuotationHeader";
import { ReceiptHeader } from "../entity/ReceiptHeader";

export const generateQuotationPDF = async (quotation: QuotationHeader): Promise<Buffer> => {
  return new Promise((resolve) => {
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
    doc.text("Total (USD)", 400, tableTop);
    doc.text("Total (LKR)", 480, tableTop);
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Line Items
    let y = tableTop + 25;
    quotation.details?.forEach((item) => {
      doc.text(item.itemCode || "-", 50, y);
      doc.text(item.itemDescription || "-", 120, y, { width: 220 });
      doc.text(item.quantity.toString(), 350, y);
      doc.text(`$${Number(item.lineTotalUsd).toLocaleString()}`, 400, y);
      doc.text(`Rs.${Number(item.lineTotalLkr).toLocaleString()}`, 480, y);
      y += 25;
    });

    // Grand Totals
    doc.moveTo(50, y).lineTo(550, y).stroke();
    doc.fontSize(12).text("GRAND TOTAL:", 300, y + 20);
    doc.text(`$${Number(quotation.totalUsd).toLocaleString()}`, 400, y + 20);
    doc.text(`Rs.${Number(quotation.totalLkr).toLocaleString()}`, 480, y + 20);

    doc.end();
  });
};

export const generateReceiptPDF = async (receipt: ReceiptHeader): Promise<Buffer> => {
  return new Promise((resolve) => {
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
    doc.text("Price (USD)", 400, tableTop);
    doc.text("Price (LKR)", 480, tableTop);
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Line Items
    let y = tableTop + 25;
    receipt.details?.forEach((item) => {
      doc.text(item.itemCode || "-", 50, y);
      doc.text(item.itemDescription || "-", 120, y, { width: 220 });
      doc.text(item.quantity.toString(), 350, y);
      doc.text(`$${Number(item.lineTotalUsd).toLocaleString()}`, 400, y);
      doc.text(`Rs.${Number(item.lineTotalLkr).toLocaleString()}`, 480, y);
      y += 25;
    });

    // Totals
    doc.moveTo(50, y).lineTo(550, y).stroke();
    doc.fontSize(12).font('Helvetica-Bold').text("TOTAL PAID:", 300, y + 20);
    doc.text(`$${Number(receipt.totalPaidUsd).toLocaleString()}`, 400, y + 20);
    doc.text(`Rs.${Number(receipt.totalPaidLkr).toLocaleString()}`, 480, y + 20);

    // Paid Stamp
    y += 80;
    doc.fontSize(40).fillColor('green').opacity(0.3).text("PAID", 0, y, { align: 'center' });

    doc.end();
  });
};
