import { beachesRepository } from "./beaches.repository";
import { ApiError } from "../../utils/api-error";
import { BeachIdParamInput, CreateBeachInput, SearchBeachQueryInput } from "./beaches.validation";


export async function createBeach(data: CreateBeachInput){
    const beachExists = await beachesRepository.findByNameAndCity(data.name, data.city);

    if(beachExists){
        throw new ApiError(409, "Beach already exists in this city");
    }

    const createdBeach = await beachesRepository.createBeach(data);

    return createdBeach

}


export async function findMany(filters: SearchBeachQueryInput) {


    const [beaches, total] = await beachesRepository.findMany(filters);

    if (beaches.length < 1) {
        throw new ApiError(200, "No beaches are found");
    }

    return { data: beaches, pagination: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) } }


}


export async function findBeachById(beachId: string) {

    if (!beachId) {
        throw new ApiError(400, "Beach Id is required");
    }

    const beach = await beachesRepository.findById(beachId);

    if (!beach) {
        throw new ApiError(404, "Beach not found");
    }

    return beach

}