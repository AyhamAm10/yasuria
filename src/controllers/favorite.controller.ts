import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data_source";
import { Entity_Type, Favorite } from "../entity/Favorites";
import { Car } from "../entity/Car";
import { Property } from "../entity/Property";
import { In } from "typeorm";


const favoriteRepository = AppDataSource.getRepository(Favorite);
const carRepository = AppDataSource.getRepository(Car);
const propertyRepository = AppDataSource.getRepository(Property);

export const toggleFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req["currentUser"].id;
    const { item_id, item_type } = req.body;

    if (!item_id || !item_type) {
       res.status(400).json({ message: "item_id and item_type are required" });
    }

    const existing = await favoriteRepository.findOneBy({
      user: { id: userId },
      item_id,
      item_type,
    });

    if (existing) {
      await favoriteRepository.remove(existing);
       res.status(200).json({ message: "Unliked successfully" });
    } else {
      const newLike = favoriteRepository.create({
        user: { id: userId },
        item_id,
        item_type,
      });
      await favoriteRepository.save(newLike);
       res.status(201).json({ message: "Liked successfully" });
    }
  } catch (error) {
    next(error);
  }
};

export const getUserFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req["currentUser"].id;
    const { item_type } = req.query;

    const favorites = await favoriteRepository.find({
      where: {
        user: { id: userId }
      },
    });

    const itemIds = favorites.map(fav => fav.item_id);

    let likedItems = [];
    if (item_type === Entity_Type.car) {
      likedItems = await carRepository.findBy({id: In(itemIds)});
    } else if (item_type === Entity_Type.properties || !item_type) {
      likedItems = await propertyRepository.findBy({id: In(itemIds)});
    }

     res.status(200).json({
      data: likedItems,
      message: "Favorites retrieved successfully"
    });
  } catch (error) {
    next(error);
  }
};
