import { beachesRepository } from "./beaches.repository";
import { ApiError } from "../../utils/api-error";
import { env } from "../../config/env";
import { BeachIdParamInput, CreateBeachInput, NearbyBeachQueryInput, SearchBeachQueryInput } from "./beaches.validation";
import { haversineDistanceKm } from "../../utils/geo";


export async function createBeach(data: CreateBeachInput) {
    const beachExists = await beachesRepository.findByNameAndCity(data.name, data.city);

    if (beachExists) {
        throw new ApiError(409, "Beach already exists in this city");
    }

    const createdBeach = await beachesRepository.createBeach(data);

    return createdBeach

}

export async function searchNearbyBeaches(query: NearbyBeachQueryInput) {

    const searchRadius = query.radius ?? env.NEARBY_BEACH_RADIUS_KM;

    const allBeaches = await beachesRepository.findAll();

    const possibleBeaches = allBeaches.map((beach) => {

        const distance = haversineDistanceKm(query.latitude, query.longitude, beach.latitude, beach.longitude);

        return { beach, distance }
    });

    const filtredBeachs = possibleBeaches.filter((item) => item.distance <= searchRadius)
            .sort((a, b) => a.distance - b.distance);

    return filtredBeachs

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