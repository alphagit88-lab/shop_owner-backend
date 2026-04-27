import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ReceiptHeader } from "./ReceiptHeader";
import { QuotationDetail } from "./QuotationDetail";
import { Item } from "./Item";

@Entity("receipt_detail")
export class ReceiptDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ReceiptHeader, (rh) => rh.details, { onDelete: "CASCADE" })
  @JoinColumn({ name: "receipt_no" })
  receipt: ReceiptHeader;

  @Column({ name: "receipt_no" })
  receiptNo: number;

  @ManyToOne(() => QuotationDetail, (qd) => qd.receiptDetails, { nullable: true })
  @JoinColumn({ name: "quotation_detail_id" })
  quotationDetail: QuotationDetail;

  @Column({ name: "quotation_detail_id", nullable: true })
  quotationDetailId: number;

  @ManyToOne(() => Item, (i) => i.receiptDetails, { nullable: true })
  @JoinColumn({ name: "item_id" })
  item: Item;

  @Column({ name: "item_id", nullable: true })
  itemId: number;

  // Snapshot fields
  @Column({ name: "item_code", length: 50, nullable: true })
  itemCode: string;

  @Column({ name: "item_description", type: "text", nullable: true })
  itemDescription: string;

  @Column({ name: "unit_price_usd", type: "numeric", precision: 12, scale: 2, default: 0 })
  unitPriceUsd: number;

  @Column({ name: "unit_price_lkr", type: "numeric", precision: 12, scale: 2, default: 0 })
  unitPriceLkr: number;

  @Column({ name: "discount_pct", type: "numeric", precision: 5, scale: 2, default: 0 })
  discountPct: number;

  @Column({ name: "discount_amount_usd", type: "numeric", precision: 12, scale: 2, default: 0 })
  discountAmountUsd: number;

  @Column({ name: "discount_amount_lkr", type: "numeric", precision: 12, scale: 2, default: 0 })
  discountAmountLkr: number;

  @Column({ default: 1 })
  quantity: number;

  @Column({ name: "line_total_usd", type: "numeric", precision: 12, scale: 2, default: 0 })
  lineTotalUsd: number;

  @Column({ name: "line_total_lkr", type: "numeric", precision: 12, scale: 2, default: 0 })
  lineTotalLkr: number;
}
