import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Setting } from "../entity/Setting";

export const getSettings = async (_req: Request, res: Response) => {
  try {
    const settingRepo = AppDataSource.getRepository(Setting);
    const settings = await settingRepo.find();
    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);
    
    // Default values if not set
    if (!settingsMap.currency) settingsMap.currency = "LKR";
    
    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ message: "Error fetching settings" });
  }
};

export const updateSetting = async (req: Request, res: Response) => {
  try {
    const { key, value } = req.body;
    const settingRepo = AppDataSource.getRepository(Setting);
    
    let setting = await settingRepo.findOneBy({ key });
    if (setting) {
      setting.value = value;
    } else {
      setting = settingRepo.create({ key, value });
    }
    
    await settingRepo.save(setting);
    res.json({ message: "Setting updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating setting" });
  }
};
