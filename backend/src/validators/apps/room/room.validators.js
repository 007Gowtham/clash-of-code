import { body,query,param } from "express-validator";
import { AvailableRoomStatus } from "../../../constants";


export const RoomValidator = () =>{
    return [
        body("name")
    ]
}