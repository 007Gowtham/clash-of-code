import logger from "../logger/winston.logger.js";
import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, [], err.stack);
  }

  const response = {
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
  };

  logger.error(error.message);
  return res.status(error.statusCode).json(response);
};
