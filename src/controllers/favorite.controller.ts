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
    const userId = req.currentUser?.id;
    const { item_type } = req.query;

    let favorites = [];

    if (item_type) {
      favorites = await favoriteRepository.find({
        where: {
          user: { id: userId },
          item_type: item_type as Entity_Type,
        },
      });
    } else {
      favorites = await favoriteRepository.find({
        where: {
          user: { id: userId },
        },
      });
    }

    const carIds = favorites
      .filter(fav => fav.item_type === Entity_Type.car)
      .map(fav => fav.item_id);

    const propertyIds = favorites
      .filter(fav => fav.item_type === Entity_Type.properties)
      .map(fav => fav.item_id);

    const carsPromise = carIds.length ? carRepository.findBy({ id: In(carIds) }) : Promise.resolve([]);
    const propertiesPromise = propertyIds.length ? propertyRepository.findBy({ id: In(propertyIds) }) : Promise.resolve([]);

    const [cars, properties] = await Promise.all([carsPromise, propertiesPromise]);

    const carsWithType = cars.map(car => ({ ...car, product_type: Entity_Type.car }));
    const propertiesWithType = properties.map(property => ({ ...property, product_type: Entity_Type.properties }));

    let likedItems = [];
    if (item_type === Entity_Type.car) {
      likedItems = carsWithType;
    } else if (item_type === Entity_Type.properties) {
      likedItems = propertiesWithType;
    } else {
      likedItems = [...carsWithType, ...propertiesWithType]; // دمج مع تحديد النوع
    }

    res.status(200).json({
      data: likedItems,
      message: "Favorites retrieved successfully"
    });
  } catch (error) {
    next(error);
  }
};

