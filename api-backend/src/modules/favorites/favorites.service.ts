import { favoriteRepository } from "./favorite.repository";
import { ApiError } from "../../utils/api-error";
import { Prisma } from "../../generated/prisma/client";
import { beachesRepository } from "../beaches/beaches.repository";
import { FavoriteCreateInput } from "../../generated/prisma/models";
import { AddFavoriteInput, ListFavoritesQueryInput } from "./favorites.validation";

export async function addFavorite({userId, beachId}: AddFavoriteInput){
    const beach = await beachesRepository.findById(beachId);

    if(!beach){
        throw new ApiError(404, "Beach not found");
    }

    try{
       return await favoriteRepository.addFavorite({userId, beachId}); 
    }
    catch(error){
        if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"){
            throw new ApiError(409, "Beach already favorited");
        }
        throw error
    }

}

export async function removeFavorite({userId, beachId}: AddFavoriteInput){
    try{
        await favoriteRepository.removeFavorite({userId, beachId});
    }
    catch(error){
        if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025"){
            throw new ApiError(404, "Favorite not found");
        }
        throw error
    }
}

export async function listFavorites(userId: string, filters: ListFavoritesQueryInput){
    const [favorites, total] = await favoriteRepository.listFavorites(userId, filters);

    return { data: favorites, pagination: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) } }
}

