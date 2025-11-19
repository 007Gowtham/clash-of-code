import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { prisma } from "../../../db/index.js";
import logger from "../../../logger/winston.logger.js";
import { submissionCode } from "../../../services/judge0/submission.js";

export const  SubmissionController = asyncHandler(async(req,res,next)=>{
    logger.info("start the submission")
     const{teamId,questionId,userId,code,language}= req.body;
   
     if(!teamId || !questionId || !userId || !code || !language) throw new ApiError(500,"request valid data");
    logger.info("item getted")
    
     const team = await prisma.team.findUnique({where:{
        id:teamId
     }})

     if(!team)
     {
        logger.warn("team not found")
        throw new ApiError(404,"team not found in the db")
     }

     const question = await prisma.question.findUnique({where:{
        id:questionId
     }})

     if(!question)
     {
        logger.warn("question not found")
        throw new ApiError(404,"question not found in the db")
     }

     const user = await prisma.user.findUnique({where:{
        id:userId
     }})

     if(!user)
     {
        throw new ApiError("user not found in the db")
     }

     const solveRequest = await prisma.solveRequest.findFirst({where:{
        teamId:teamId,
        questionId:questionId,
        requestedById:userId,
        status:"APPROVED"
     }})

     console.log(solveRequest)
     if(!solveRequest)
     {
        throw new ApiError(403,"The question not assign to the current user")
     }
   

     const sub = await submissionCode(code,language,question)
    
     return res.status(200).json(new ApiResponse(200,sub,"code submmited"))
    
})