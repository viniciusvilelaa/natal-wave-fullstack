// src/modules/auth/auth.controller.ts
import { Request, Response } from "express";
import * as authService from "./auth.service";
import { authRepository } from "./auth.repository";
import { ApiError } from "../../utils/api-error";

export async function register(req: Request, res: Response) {
  const result = await authService.registerUser(req.body);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body);
  res.status(200).json(result);
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;
  const result = await authService.refresh(refreshToken);
  res.status(200).json(result);
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);
  res.status(204).send();
}

export async function me(req: Request, res: Response) {
  const user = await authRepository.findUserById(req.userId!);

  if (!user) {
    throw new ApiError(404, "Usuário não encontrado");
  }

  res.status(200).json(user);
}