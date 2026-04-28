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
    const { id } = req.params;
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
    const { id } = req.params;
    await itemRepo.delete(id);
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item" });
  }
};
