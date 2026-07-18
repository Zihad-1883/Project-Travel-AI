import { Router } from "express";
import authRouter from "../modules/auth/auth.routes";
import userRouter from "../modules/user/user.routes";
import packagesRouter from "../modules/packages/packages.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/packages", packagesRouter);

export default router;
