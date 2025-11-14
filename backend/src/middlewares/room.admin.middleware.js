import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import logger from "../logger/winston.logger.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { prisma } from "../db/index.js";


const roomVerifyToken = asyncHandler(async(req,resizeBy,next)=>{
    const { roomId } = req.params;

    const room = await prisma.room.findUnique({
        where:{
            id:roomId
        }
    })

    if(!room){
        throw new ApiError(404,"room not found");
    }

    if(!room.adminToken)
    {
        throw new ApiError(403,"admin acces token not valid please provide the valid token to access these service");
    }

    if(room.createdById!==req.user.id)
    {
         throw new ApiError(403,"you not permission to access these service");
    }

    const decoded = jwt.verify(room.adminToken, process.env.JWT_SECRET);
    logger.info("the token decoded successfully")
    next()
})
export {
    roomVerifyToken
}