import { CreateRoomController } from "../../../controllers/apps/room/room.controller";
import { validate } from "../../../validators/validate.js";
import { Router } from "express";
import verifyToken from "../../../middlewares/auth.middleware.js";


const router = Router();    


route