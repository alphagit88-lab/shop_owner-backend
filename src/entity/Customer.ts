import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Relation,
} from "typeorm";
import { QuotationHeader } from "./QuotationHeader";
import { ReceiptHeader } from "./ReceiptHeader";

@Entity("customers")
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "customer_name", length: 200 })
  customerName: string;

  @Column({ name: "phone_number", length: 30, nullable: true })
  phoneNumber: string;

  @Column({ length: 200, nullable: true })
  email: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @OneToMany(() => QuotationHeader, (qh) => qh.customer)
  quotations: Relation<QuotationHeader[]>;

  @OneToMany(() => ReceiptHeader, (rh) => rh.customer)
  receipts: Relation<ReceiptHeader[]>;
}
