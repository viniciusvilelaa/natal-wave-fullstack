import { prisma } from "../../lib/prisma"
import { Beach, Prisma } from "../../generated/prisma/client";
import { ListFavoritesQueryInput } from "./favorites.validation";

export const favoriteRepository = {

    addFavorite(data: Prisma.FavoriteUncheckedCreateInput) {
        return prisma.favorite.create({ data });
    },

    removeFavorite(userId_beachId: Prisma.FavoriteUserIdBeachIdCompoundUniqueInput){
        return prisma.favorite.delete({
            where: {
                userId_beachId
            }
        });
    },

    listFavorites(userId: string, { page, limit }: ListFavoritesQueryInput){
        const where: Prisma.FavoriteWhereInput = { userId };

        return Promise.all([
            prisma.favorite.findMany({
                where,
                include: {beach: true},
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" }
            }),
            prisma.favorite.count({where})
        ]);
    }


}