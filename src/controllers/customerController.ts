import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Customer } from "../entity/Customer";
import { ILike } from "typeorm";

const customerRepo = AppDataSource.getRepository(Customer);

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let whereClause = {};

    if (search) {
      whereClause = [
        { customerName: ILike(`%${search}%`) },
        { email: ILike(`%${search}%`) },
        { phoneNumber: ILike(`%${search}%`) }
      ];
    }

    const customers = await customerRepo.find({ where: whereClause, order: { customerName: "ASC" } });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customers" });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const customer = customerRepo.create(req.body);
    await customerRepo.save(customer);
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Error creating customer" });
  }
};
