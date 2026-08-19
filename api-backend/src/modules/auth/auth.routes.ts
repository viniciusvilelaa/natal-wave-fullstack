import { Router } from "express";
import * as authController from "./auth.controller";
import { validate } from "../../middleware/schema.middleware"
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { registerSchema, loginSchema, refreshTokenSchema, oauthLoginSchema } from "./auth.validation";

const router = Router();

router.post(
    "/register",
    validate(registerSchema),
    asyncHandler(authController.register)
);

router.post(
    "/login",
    validate(loginSchema),
    asyncHandler(authController.login)
);

router.post(
    "/oauth",
    validate(oauthLoginSchema),
    asyncHandler(authController.oauthLogin)
);

router.post(
    "/refresh",
    validate(refreshTokenSchema),
    asyncHandler(authController.refresh)
);

router.post(
    "/logout",
    validate(refreshTokenSchema),
    asyncHandler(authController.logout)
);

router.get(
    "/me",
    authMiddleware,
    asyncHandler(authController.me)
);

export default router;