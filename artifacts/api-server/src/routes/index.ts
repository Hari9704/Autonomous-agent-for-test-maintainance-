import { Router, type IRouter } from "express";
import healthRouter from "./health";
import accessRouter from "./access";
import mcpRouter from "./mcp";

const router: IRouter = Router();

router.use(healthRouter);
router.use(accessRouter);
router.use(mcpRouter);

export default router;
