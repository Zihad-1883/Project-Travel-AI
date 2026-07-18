import { Router } from "express";
import authRouter from "../modules/auth/auth.routes";
import userRouter from "../modules/user/user.routes";
import packagesRouter from "../modules/packages/packages.routes";
import bookingsRouter from "../modules/bookings/bookings.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/packages", packagesRouter);
router.use("/bookings", bookingsRouter);

export default router;
