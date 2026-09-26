import { z } from "zod";

export const addFavoriteSchema = z.object({
  userId: z.string().trim().cuid("User ID is required"),
  beachId: z.string().trim().cuid("Beach ID is required"),
});

export const createFavoriteSchema = addFavoriteSchema;

export const favoriteBeachIdParamSchema = z.object({
  beachId: z.string().trim().cuid("Beach ID is required"),
});

export const favoriteIdParamSchema = z.object({
  id: z.string().trim().cuid("Beach ID is required"),
});

export const listFavoritesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>;
export type CreateFavoriteInput = z.infer<typeof createFavoriteSchema>;
export type FavoriteBeachIdParamInput = z.infer<typeof favoriteBeachIdParamSchema>;
export type FavoriteIdParamInput = z.infer<typeof favoriteIdParamSchema>;
export type ListFavoritesQueryInput = z.infer<typeof listFavoritesQuerySchema>;
