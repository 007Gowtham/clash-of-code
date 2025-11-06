import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";
import { errorHandler } from "../middlewares/error.middlewares.js";


export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if(errors.isEmpty()) return next();

  const extractedErrors = [];
  errors.array().map((error) => extractedErrors.push({[error.path]:error.msg}));

  return next(new ApiError(422, 'Validation Error', extractedErrors));
};
