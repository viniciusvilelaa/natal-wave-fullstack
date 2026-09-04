import { z } from "zod";

export const cardinalDirectionEnum = z.enum(
  ["N", "NE", "E", "SE", "S", "SW", "W", "NW"],
  {
    message: "Invalid cardinal direction",
  }
);

export const bottomTypeEnum = z.enum(
  ["AREIA", "RECIFE", "PEDRA", "LAJE", "MISTO"],
  {
    message: "Invalid bottom type",
  }
);

export const createBeachSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long").max(100),
  city: z.string().trim().min(2, "City must be at least 2 characters long").max(100),
  state: z.string().trim().min(2, "State must be at least 2 characters long").max(100),
  country: z.string().trim().min(2, "Country must be at least 2 characters long").max(100),
  imageUrl: z.string().trim().url("Invalid image URL").optional().nullable(),
  description: z.string().trim().max(1000, "Description must be under 1000 characters").optional().nullable(),
  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  bestSwellDirections: z.array(cardinalDirectionEnum).default([]),
  bestWindDirections: z.array(cardinalDirectionEnum).default([]),
  bottomType: bottomTypeEnum.optional().nullable(),
});

export const updateBeachSchema = createBeachSchema.partial();

export const beachIdParamSchema = z.object({
  id: z.string().cuid("Beach ID is required"),
});

export const searchBeachQuerySchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const nearbyBeachQuerySchema = z.object({
  latitude: z
    .coerce.number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z
    .coerce.number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  radius: z.coerce.number().positive("Radius must be a positive number").optional(),
});

export type CardinalDirectionInput = z.infer<typeof cardinalDirectionEnum>;
export type BottomTypeInput = z.infer<typeof bottomTypeEnum>;
export type CreateBeachInput = z.infer<typeof createBeachSchema>;
export type UpdateBeachInput = z.infer<typeof updateBeachSchema>;
export type BeachIdParamInput = z.infer<typeof beachIdParamSchema>;
export type SearchBeachQueryInput = z.infer<typeof searchBeachQuerySchema>;
