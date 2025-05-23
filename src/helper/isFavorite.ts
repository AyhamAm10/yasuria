import { AppDataSource } from "../config/data_source";
import { Entity_Type, Favorite } from "../entity/Favorites";


const favoriteRepository = AppDataSource.getRepository(Favorite);

export const isFavorite = async (
  userId: number,
  itemId: number,
  itemType: Entity_Type
): Promise<boolean> => {
  const favorite = await favoriteRepository.findOne({
    where: {
      user: { id: userId },
      item_id: itemId,
      item_type: itemType,
    },
  });

  return !!favorite;
};
