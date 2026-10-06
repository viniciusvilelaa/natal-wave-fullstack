import { NextFunction, Request, Response } from "express";
import { createHash, timingSafeEqual } from "node:crypto";
import { env } from "../config/env";
import { ApiError } from "../utils/api-error";

//Hash deixa os dois valores com o mesmo tamanho, exigido pelo timingSafeEqual
function sha256(value: string): Buffer {
    return createHash("sha256").update(value).digest();
}

//Comparacao em tempo constante para nao vazar a chave por timing
function isValidAdminKey(adminKey: string): boolean {
    return timingSafeEqual(sha256(adminKey), sha256(env.ADMIN_API_KEY));
}

export function adminMiddleware(req: Request, _res: Response, next: NextFunction) {

    //Captura a chave de admin do header
    const adminKey = req.header("x-admin-key");

    //Mesma resposta para chave ausente ou invalida
    if (!adminKey || !isValidAdminKey(adminKey)) {
        throw new ApiError(401, "Invalid admin key");
    }

    next();
}
