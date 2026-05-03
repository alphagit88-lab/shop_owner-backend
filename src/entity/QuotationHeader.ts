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
import { QuotationDetail } from "./QuotationDetail";
import { ReceiptHeader } from "./ReceiptHeader";

export type QuotationStatus = "DRAFT" | "SENT" | "ACCEPTED" | "CONVERTED";

@Entity("quotation_header")
export class QuotationHeader {
  @PrimaryGeneratedColumn({ name: "quotation_no" })
  quotationNo: number;

  @ManyToOne(() => Customer, (c) => c.quotations, { nullable: true })
  @JoinColumn({ name: "customer_id" })
  customer: Customer;

  @Column({ name: "customer_id", nullable: true })
  customerId: number;

  @Column({ name: "customer_name", length: 200, nullable: true })
  customerName: string;

  @CreateDateColumn({ name: "quotation_date" })
  quotationDate: Date;

  @Column({ length: 20, default: "DRAFT" })
  status: QuotationStatus;


  @Column({ name: "total_lkr", type: "numeric", precision: 12, scale: 2, nullable: true })
  totalLkr: number;

  @Column({ type: "text", nullable: true })
  notes: string;

  @OneToMany(() => QuotationDetail, (qd) => qd.quotation, { cascade: true })
  details: QuotationDetail[];

  @OneToMany(() => ReceiptHeader, (rh) => rh.quotation)
  receipts: ReceiptHeader[];
}
