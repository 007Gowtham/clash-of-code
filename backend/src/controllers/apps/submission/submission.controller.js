import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { prisma } from "../../../db/index.js";
import logger from "../../../logger/winston.logger.js";
import { use } from "react";


export default SubmissionController = asyncHandler(async(req,res,next)=>{
    const [ questionId,userId,code,language] = req.body;


    const question = await prisma.findUnique({where:{
        id:questionId
    }})

    if(!question)
    {
        logger.info("question not found ")
        throw new ApiError(404,"question not found")
    }

    const user = await prisma.findUnique({where:{
           id:userId
    }})

    if(!user)
    {
        logger.info("user not found")
        throw new ApiError(404,"user not found")
    }

    const team = await prisma.findUnique({where:{
        id:user.id
    }})
    
})