import * as favoriteService from "../favorites/favorites.service";
import { Request, Response } from "express";
import { AddFavoriteInput, CreateFavoriteInput, FavoriteBeachIdParamInput, FavoriteIdParamInput, ListFavoritesQueryInput } from "../favorites/favorites.validation";

export async function addFavorite(req: Request, res: Response) {
    const userId = req.userId!;
    const { beachId } = req.params as FavoriteBeachIdParamInput;


    const favorite = await favoriteService.addFavorite({ userId, beachId });

    res.status(201).json(favorite);
}

export async function removeFavorite(req: Request, res: Response) {
    const userId = req.userId!;

    const { beachId } = req.params as FavoriteBeachIdParamInput;

    const removedFavorite = await favoriteService.removeFavorite({userId, beachId});

    res.status(204).send();
    
}
