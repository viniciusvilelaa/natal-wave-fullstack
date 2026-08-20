import { Router } from "express";
import * as authController from "./auth.controller";
import { validate } from "../../middleware/schema.middleware"
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { registerSchema, loginSchema, refreshTokenSchema, oauthLoginSchema } from "./auth.validation";

const authRouter = Router();

authRouter.post(
    "/register",
    validate(registerSchema),
    asyncHandler(authController.register)
);

authRouter.post(
    "/login",
    validate(loginSchema),
    asyncHandler(authController.login)
);

authRouter.post(
    "/oauth",
    validate(oauthLoginSchema),
    asyncHandler(authController.oauthLogin)
);

authRouter.post(
    "/refresh",
    validate(refreshTokenSchema),
    asyncHandler(authController.refresh)
);

authRouter.post(
    "/logout",
    validate(refreshTokenSchema),
    asyncHandler(authController.logout)
);

authRouter.get(
    "/me",
    authMiddleware,
    asyncHandler(authController.me)
);

export default authRouter;