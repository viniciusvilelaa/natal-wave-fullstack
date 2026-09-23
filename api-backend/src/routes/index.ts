import { Router } from "express";
import authRouter from "../modules/auth/auth.routes";
import beachesRouter from "../modules/beaches/beaches.routes";

const router = Router();


router.use('/auth', authRouter);
router.use('/beaches', beachesRouter);


export default router