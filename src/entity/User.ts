import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  username: string;

  @Column({ name: "password_hash", length: 255 })
  passwordHash: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
