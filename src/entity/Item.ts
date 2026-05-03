import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Relation,
} from "typeorm";
import { QuotationDetail } from "./QuotationDetail";
import { ReceiptDetail } from "./ReceiptDetail";

@Entity("items")
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "item_code", length: 50, nullable: true })
  itemCode: string;

  @Column({ name: "item_description", type: "text" })
  itemDescription: string;


  @Column({ name: "unit_price_lkr", type: "numeric", precision: 12, scale: 2 })
  unitPriceLkr: number;

  @Column({ name: "is_available", default: true })
  isAvailable: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @OneToMany(() => QuotationDetail, (qd) => qd.item)
  quotationDetails: Relation<QuotationDetail[]>;

  @OneToMany(() => ReceiptDetail, (rd) => rd.item)
  receiptDetails: Relation<ReceiptDetail[]>;
}
