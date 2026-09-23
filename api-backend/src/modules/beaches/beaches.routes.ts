import { Router } from "express";
import * as beachesController from "./beaches.controller";
import { validate, validateParams, validateQuery } from "../../middleware/schema.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { createBeachSchema, updateBeachSchema, nearbyBeachQuerySchema, searchBeachQuerySchema, BeachIdParamInput, beachIdParamSchema } from "./beaches.validation";

const beachesRouter = Router();

beachesRouter.post(
    "/",
    validate(createBeachSchema),
    asyncHandler(beachesController.createBeach)
);



beachesRouter.get(
    "/",
    validateQuery(searchBeachQuerySchema),
    asyncHandler(beachesController.search)
);

beachesRouter.get(
    "/nearby",
    validateQuery(nearbyBeachQuerySchema),
    asyncHandler(beachesController.searchNearbyBeaches)

);

beachesRouter.patch(
    "/:id",
    validateParams(beachIdParamSchema),
    validate(updateBeachSchema),
    asyncHandler(beachesController.updateBeach)
);

beachesRouter.get(
    "/:id",
    validateParams(beachIdParamSchema),
    asyncHandler(beachesController.findById)
);

export default beachesRouter