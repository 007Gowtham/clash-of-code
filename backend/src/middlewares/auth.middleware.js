import jwt from 'jsonwebtoken';
import {ApiError} from '../utils/ApiError.js';
import { prisma } from '../db/index.js';
import logger from '../logger/winston.logger.js';

const verifyToken = async(req, res, next) => {
    const token = req.headers['authorization']?.replace('Bearer ', '');

    logger.info(`Verifying token: ${token}`);
    
    if (!token) {
        return next(new ApiError(401, 'No token provided'));
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
           logger.info(`Decoded token: ${JSON.stringify(decoded.id)}`);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

 logger.info(`User fetched from DB: ${JSON.stringify(user)}`);


        if (!user) {
            return next(new ApiError(401, 'User not found'));
        }
        logger.info(`Token verified successfully for user ID: ${user.id}`);
        req.user = user;
        next();
    } catch (error) {
        return next(new ApiError(401, 'Invalid token'));
    }
  
};

export default verifyToken;