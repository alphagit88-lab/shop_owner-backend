import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Item } from "../entity/Item";
import { ILike } from "typeorm";

const itemRepo = AppDataSource.getRepository(Item);

export const getAllItems = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let whereClause = {};

    if (search) {
      whereClause = [
        { itemCode: ILike(`%${search}%`) },
        { itemDescription: ILike(`%${search}%`) }
      ];
    }

    const items = await itemRepo.find({ 
      where: whereClause,
      order: { createdAt: "DESC" }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items" });
  }
};

export const createItem = async (req: Request, res: Response) => {
  try {
    const item = itemRepo.create(req.body);
    await itemRepo.save(item);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: "Error creating item" });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    let item = await itemRepo.findOneBy({ id: parseInt(id) });
    if (!item) return res.status(404).json({ message: "Item not found" });

    itemRepo.merge(item, req.body);
    await itemRepo.save(item);
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Error updating item" });
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await itemRepo.delete(id);
    if (result.affected === 0) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted successfully" });
  } catch (error: any) {
    console.error("Delete item error:", error);
    
    const errorString = String(error.message || error).toLowerCase();
    const isForeignKey = error.code === '23503' || 
                         errorString.includes('foreign key') || 
                         errorString.includes('violates constraint');

    if (isForeignKey) {
      return res.status(400).json({ 
        message: "Cannot delete this item because it is referenced in existing quotations or receipts. Delete those records first." 
      });
    }
    
    res.status(500).json({ message: "Error deleting item" });
  }
};
