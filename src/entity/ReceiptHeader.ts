import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Customer } from "./Customer";
import { QuotationHeader } from "./QuotationHeader";
import { ReceiptDetail } from "./ReceiptDetail";

export type PaymentMethod = "Cash" | "Card" | "Bank Transfer" | "Cheque";

@Entity("receipt_header")
export class ReceiptHeader {
  @PrimaryGeneratedColumn({ name: "receipt_no" })
  receiptNo: number;

  @ManyToOne(() => QuotationHeader, (qh) => qh.receipts, { nullable: true })
  @JoinColumn({ name: "quotation_no" })
  quotation: QuotationHeader;

  @Column({ name: "quotation_no", nullable: true })
  quotationNo: number;

  @ManyToOne(() => Customer, (c) => c.receipts, { nullable: true })
  @JoinColumn({ name: "customer_id" })
  customer: Customer;

  @Column({ name: "customer_id", nullable: true })
  customerId: number;

  @Column({ name: "customer_name", length: 200, nullable: true })
  customerName: string;

  @CreateDateColumn({ name: "receipt_date" })
  receiptDate: Date;

  @Column({ name: "payment_method", length: 50, nullable: true })
  paymentMethod: PaymentMethod;


  @Column({ name: "total_paid_lkr", type: "numeric", precision: 12, scale: 2, nullable: true })
  totalPaidLkr: number;

  @Column({ length: 20, default: "PAID" })
  status: string;

  @OneToMany(() => ReceiptDetail, (rd) => rd.receipt, { cascade: true })
  details: ReceiptDetail[];
}
