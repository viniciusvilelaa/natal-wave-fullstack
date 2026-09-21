import * as beachesService from "../beaches/beaches.service";
import { Request, Response } from "express";
import { BeachIdParamInput, SearchBeachQueryInput, UpdateBeachInput } from "./beaches.validation";

//Create a beach
export async function createBeach(req: Request, res: Response) {
    const beach = await beachesService.createBeach(req.body);
    res.status(201).json(beach);
}

//Update a beach by id
export async function updateBeach(req: Request, res: Response) {
    const { id } = req.params as BeachIdParamInput;
    const data = req.body as UpdateBeachInput
    const updatedBeach = await beachesService.updateBeach(id, data);

    res.status(200).json(updatedBeach);
}

//Get beach by id
export async function findById(req: Request, res: Response) {
    const { id } = req.params as BeachIdParamInput;

    const beach = await beachesService.findBeachById(id);

    res.status(200).json(beach);
}

//Recive filters by query and answer with beaches and pagination
export async function search(req: Request, res: Response) {
    const filters = req.query as unknown as SearchBeachQueryInput;

    const beachesWithPagination = await beachesService.searchBeaches(filters);


    res.status(200).json(beachesWithPagination);
}