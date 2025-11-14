import { prisma } from  '../../../db/index.js';
import { ApiError } from '../../../utils/ApiError.js';



export const createRoomController = async (data) =>{
    const response =  await prisma.room.create({
        data:{
        name:data.name,
        password:data.password,
        maxTeams:data.maxTeams,
        maxTeamSize:data.maxTeamSize,
        duration:data.duration,
        status:data.status,
        startTime :data.startTime,
        endTime :data.endTime,
        adminToken:data.adminToken,
        createdById:data.createdById
        }
    });
    return response;    
}