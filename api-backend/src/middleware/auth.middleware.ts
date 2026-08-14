import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/api-error";

//Estado global do request
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    
    //Captura o header de autorizacao
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new ApiError(401, "Invalid authentication token");
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        throw new ApiError(401, "Invalid token format, use: Bearer <token>");
    }

    try {
        //verifica token e passa como payload
        const payload = verifyToken(token);
        req.userId = payload.sub;
        next();
    } catch{
        throw new ApiError(401, "Invalid or expired token");
    }




}