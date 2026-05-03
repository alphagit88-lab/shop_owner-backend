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

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customer = await customerRepo.findOneBy({ id: parseInt(req.params.id as string) });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer" });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await customerRepo.findOneBy({ id: parseInt(req.params.id as string) });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    
    customerRepo.merge(customer, req.body);
    await customerRepo.save(customer);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: "Error updating customer" });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const result = await customerRepo.delete(req.params.id);
    if (result.affected === 0) return res.status(404).json({ message: "Customer not found" });
    res.status(204).send();
  } catch (error: any) {
    console.error("CRITICAL: Delete customer error full object:", error);
    
    const errorString = String(error.message || error).toLowerCase();
    const isForeignKey = error.code === '23503' || 
                         errorString.includes('foreign key') || 
                         errorString.includes('violates constraint');

    if (isForeignKey) {
      return res.status(400).json({ 
        message: "Cannot delete this customer because they have existing quotations or receipts. Delete those records first."
      });
    }
    
    res.status(500).json({ 
      message: "Error deleting customer", 
      error: error.message 
    });
  }
};
