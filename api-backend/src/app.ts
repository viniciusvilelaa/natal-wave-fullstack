import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./modules/auth/auth.routes";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

// Middlewares de Segurança e Utilitários
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

// Parsers de requisição
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiter específico para rotas sensíveis (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Janela de 15 minutos
  max: 10, 
  standardHeaders: true, 
  legacyHeaders: false, 
  message: {
    error: "Too many login attempts, please try again later",
  },
});

// Aplicação do Rate Limit nas rotas de Login e Registro
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Rotas da aplicação
app.use("/api/auth", authRoutes);

// Middleware global de tratamento de erros
app.use(errorMiddleware);

export default app;
