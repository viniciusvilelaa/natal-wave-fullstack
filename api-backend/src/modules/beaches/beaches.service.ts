import { beachesRepository } from "./beaches.repository";
import { ApiError } from "../../utils/api-error";
import { BeachIdParamInput, CreateBeachInput, SearchBeachQueryInput } from "./beaches.validation";


export async function createBeach(data: CreateBeachInput){
    
}


export async function findAll(filters: SearchBeachQueryInput) {


    const [beaches, total] = await beachesRepository.findAll(filters);

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