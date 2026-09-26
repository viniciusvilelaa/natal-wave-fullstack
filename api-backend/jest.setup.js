process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/natal_wave_test?schema=public";
process.env.JWT_SECRET = "test_super_secret_jwt_key_1234567890";
process.env.ACCESS_TOKEN_EXPIRES_IN = "15m";
process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS = "30";
process.env.STORMGLASS_API_KEY = "test_stormglass_api_key";
process.env.PORT = "3333";
