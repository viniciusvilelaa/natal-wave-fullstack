import { prisma } from "../../lib/prisma"
import { Prisma } from "../../generated/prisma/client";
import { CreateBeachInput, SearchBeachQueryInput, UpdateBeachInput } from "./beaches.validation";
export const beachesRepository = {

    createBeach(data: Prisma.BeachCreateInput) {
        return prisma.beach.create({ data });
    },


    findAll(filters: SearchBeachQueryInput) {
        const { query, city, state, page, limit } = filters;

        const where: Prisma.BeachWhereInput = {
            ...(query && {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { city: { contains: query, mode: 'insensitive' } }
                ],
            }),
            ...(city && { city: { equals: city, mode: "insensitive" } }),
            ...(state && { state: { equals: state, mode: "insensitive" } }),

        };

        return Promise.all([
            prisma.beach.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { name: "asc" }
            }),
            prisma.beach.count({where})
        ]);
        

    },

    findById(id: string) {
        return prisma.beach.findUnique({
            where: { id }
        });
    },

    update(id: string, data: Prisma.BeachUpdateInput) {
        return prisma.beach.update({
            where: { id },
            data
        });
    },

    delete(id: string) {
        return prisma.beach.delete({
            where: { id }
        })
    }


}