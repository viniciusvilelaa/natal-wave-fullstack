import { prisma } from "../../lib/prisma"
import { Beach, Prisma } from "../../generated/prisma/client";

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

    listFavorites(userId: string){
        return prisma.favorite.findMany({
            where: {
                userId
            },
            include: {beach: true}
        });
    }


}