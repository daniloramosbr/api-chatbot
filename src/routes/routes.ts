import { Router } from "express";
import BotController from "../controllers/BotController";

const routes = Router()

routes.post('/bot', BotController.RunBot);

export default routes