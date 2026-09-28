import request from "supertest";
import app from "../../../app";
import { beachesRepository } from "../beaches.repository";

jest.mock("../beaches.repository");

const mockedBeachesRepo = jest.mocked(beachesRepository);

const BEACH_ID = "cjld2cjxh0000qzrmn831i7rn";

describe("Beaches Routes (/api/beaches)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* =========================================================================
     GET /api/beaches
     ========================================================================= */
  describe("GET /api/beaches", () => {
    it("deve converter page e limit da query para números e retornar 200", async () => {
      mockedBeachesRepo.findMany.mockResolvedValue([[], 0] as any);

      const response = await request(app).get("/api/beaches?page=2&limit=5");

      expect(response.status).toBe(200);
      expect(mockedBeachesRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, limit: 5 })
      );
      expect(response.body.pagination).toEqual({ page: 2, limit: 5, total: 0, totalPages: 0 });
    });

    it("deve aplicar page=1 e limit=20 como padrão quando não enviados", async () => {
      mockedBeachesRepo.findMany.mockResolvedValue([[], 0] as any);

      const response = await request(app).get("/api/beaches");

      expect(response.status).toBe(200);
      expect(mockedBeachesRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 20 })
      );
    });

    it("deve retornar 422 (Zod) quando limit for maior que 100", async () => {
      const response = await request(app).get("/api/beaches?limit=500");

      expect(response.status).toBe(422);
      expect(response.body.issues).toHaveProperty("limit");
    });
  });

  /* =========================================================================
     GET /api/beaches/nearby
     ========================================================================= */
  describe("GET /api/beaches/nearby", () => {
    it("deve retornar praias dentro do raio ordenadas por distância (200)", async () => {
      mockedBeachesRepo.findAll.mockResolvedValue([
        { id: "far", latitude: -5.95, longitude: -35.15 },
        { id: "out-of-range", latitude: -8.05, longitude: -34.9 },
        { id: "near", latitude: -5.8, longitude: -35.2 },
      ] as any);

      const response = await request(app).get(
        "/api/beaches/nearby?latitude=-5.79&longitude=-35.2&radius=50"
      );

      expect(response.status).toBe(200);
      expect(response.body.map((beach: { id: string }) => beach.id)).toEqual(["near", "far"]);
    });

    it("deve retornar 422 (Zod) quando latitude não for enviada", async () => {
      const response = await request(app).get("/api/beaches/nearby?longitude=-35.2");

      expect(response.status).toBe(422);
      expect(response.body.issues).toHaveProperty("latitude");
    });
  });

  /* =========================================================================
     PATCH /api/beaches/:id
     ========================================================================= */
  describe("PATCH /api/beaches/:id", () => {
    it("deve enviar ao repository apenas os campos informados, sem zerar as direções", async () => {
      mockedBeachesRepo.update.mockResolvedValue({ id: BEACH_ID, name: "Ponta Negra" } as any);

      const response = await request(app)
        .patch(`/api/beaches/${BEACH_ID}`)
        .send({ name: "Ponta Negra" });

      expect(response.status).toBe(200);
      expect(mockedBeachesRepo.update).toHaveBeenCalledWith(BEACH_ID, { name: "Ponta Negra" });
    });

    it("deve retornar 422 (Zod) quando o body estiver vazio", async () => {
      const response = await request(app).patch(`/api/beaches/${BEACH_ID}`).send({});

      expect(response.status).toBe(422);
      expect(mockedBeachesRepo.update).not.toHaveBeenCalled();
    });
  });

  /* =========================================================================
     POST /api/beaches
     ========================================================================= */
  describe("POST /api/beaches", () => {
    it("deve aplicar [] como padrão para as direções quando não enviadas (201)", async () => {
      mockedBeachesRepo.findByNameAndCity.mockResolvedValue(null);
      mockedBeachesRepo.createBeach.mockResolvedValue({ id: BEACH_ID } as any);

      const response = await request(app).post("/api/beaches").send({
        name: "Ponta Negra",
        city: "Natal",
        state: "RN",
        country: "Brasil",
        latitude: -5.88,
        longitude: -35.17,
      });

      expect(response.status).toBe(201);
      expect(mockedBeachesRepo.createBeach).toHaveBeenCalledWith(
        expect.objectContaining({ bestSwellDirections: [], bestWindDirections: [] })
      );
    });
  });
});
