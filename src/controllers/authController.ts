import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userRepo = AppDataSource.getRepository(User);

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await userRepo.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    // @ts-ignore (user is attached by middleware)
    const userId = req.user?.id;
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ id: user.id, username: user.username });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
