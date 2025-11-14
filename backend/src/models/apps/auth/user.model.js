import bcrypt from 'bcryptjs';
import { prisma } from '../../../db/index.js';
import { AvailableUserRoles,USER_TEMPORARY_TOKEN_EXPIRY } from '../../../constants.js';
import {ApiError}from '../../../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import logger from '../../../logger/winston.logger.js';
import crypto from 'crypto';


export const UserRegisterModel = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const emailExists = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });
  
  if (emailExists) {
    throw new ApiError(400, 'Email already in use');
  }
   if (data.role && !Object.values(AvailableUserRoles).includes(data.role)) {
    throw new ApiError(400, 'Invalid user role');
  }

  const response = await prisma.user.create({
    data: {
      name: data.username,          // If your Prisma model uses "name"
      email: data.email,
      password: hashedPassword,
      role: data.role || 'USER',
      loginType: data.loginType || 'EMAIL_PASSWORD',
    },
  });

  return response;
}

export const generateAccessToken = async (user_id) =>{
    const user = await prisma.user.findUnique({
        where:{
            id:user_id
        }
    });

    if(!user){
        throw new ApiError(404,'User not found');
    }
    const payload={
        id:user_id,
        email:user.email,
        role:user.role,
        username:user.name
    }
    const accessToken = jwt.sign(payload,process.env.JWT_ACCESS_SECRET,{
        expiresIn:process.env.JWT_ACCESS_EXPIRATION|| '1m'
    });

    return accessToken;
}

export const generateRefreshToken = async(user_id) =>{
    const user = await prisma.user.findUnique({
        where:{
            id:user_id
        }
    });
    
    if(!user){
        throw new ApiError(404,'User not found');
    }
    const payload={
        id:user_id,
    }
    const refreshToken = jwt.sign(payload,process.env.JWT_REFRESH_SECRET,{
        expiresIn:process.env.JWT_REFRESH_EXPIRATION || '7d'
    });

    logger.info(`Generated refresh token for user ${user_id}: ${refreshToken}`);

    return refreshToken;
}

export const isPasswordCorrect = async (hashedPassword, plainPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

export const generateTemporaryToken = () => {

  const unhashedToken = crypto.randomBytes(20).toString('hex');

  const hashedToken = crypto
    .createHash('sha256')
    .update(unhashedToken)
    .digest('hex');

    // Return a Date object for Prisma DateTime fields
    const tokenExpiry = new Date(Date.now() + USER_TEMPORARY_TOKEN_EXPIRY);

  return { unhashedToken, hashedToken, tokenExpiry };
};