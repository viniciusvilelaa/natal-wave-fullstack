import * as beachesService from "../beaches/beaches.service";
import { Request, Response } from "express";
import { BeachIdParamInput, UpdateBeachInput } from "./beaches.validation";

export async function createBeach(req: Request, res: Response){
    const beach = await beachesService.createBeach(req.body);
    res.status(201).json(beach);
}

export async function updateBeach(req: Request, res: Response){
    const { id } = req.params as BeachIdParamInput;
    const data = req.body as UpdateBeachInput
    const updatedBeach = await beachesService.updateBeach(id, data);

    res.status(200).json(updatedBeach);
}

