import { prisma } from "../../lib/prisma"
import { Prisma } from "../../generated/prisma/client";
import { CreateBeachInput, UpdateBeachInput } from "./beaches.validation";
export const beachesRepository = {

    createBeachSchema(data: Prisma.BeachCreateInput) {
        return prisma.beach.create({ data });
    },


    findAllBeach() {
        return prisma.beach.findMany();
    },

    findById(id: string) {
        return prisma.beach.findUnique({
            where: { id }
        });
    },

    updateBeach(id: string, data: Prisma.BeachUpdateInput) {
        return prisma.beach.update({
            where: { id },
            data
        });
    },

    deleteBeach(id: string) {
        return prisma.beach.delete({
            where: { id }
        })
    }


}