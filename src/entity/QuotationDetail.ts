import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { QuotationHeader } from "./QuotationHeader";
import { Item } from "./Item";
import { ReceiptDetail } from "./ReceiptDetail";

@Entity("quotation_detail")
export class QuotationDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => QuotationHeader, (qh) => qh.details, { onDelete: "CASCADE" })
  @JoinColumn({ name: "quotation_no" })
  quotation: QuotationHeader;

  @Column({ name: "quotation_no" })
  quotationNo: number;

  @ManyToOne(() => Item, (i) => i.quotationDetails, { nullable: true })
  @JoinColumn({ name: "item_id" })
  item: Item;

  @Column({ name: "item_id", nullable: true })
  itemId: number;

  // Snapshot fields (preserve values even if item is edited later)
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

  @Column({ default: 1 })
  quantity: number;

  @Column({ name: "line_total_usd", type: "numeric", precision: 12, scale: 2, default: 0 })
  lineTotalUsd: number;

  @Column({ name: "line_total_lkr", type: "numeric", precision: 12, scale: 2, default: 0 })
  lineTotalLkr: number;

  @OneToMany(() => ReceiptDetail, (rd) => rd.quotationDetail)
  receiptDetails: ReceiptDetail[];
}
