import express from "express";
import morganMiddleware from "./logger/morgan.logger.js";
import logger from "./logger/winston.logger.js";
import { errorHandler } from "./middlewares/error.middlewares.js";
import passport from "passport";
import './passport/index.js';
import { swaggerSpec,swaggerUi } from "./swagger/swagger.js";

const app = express();

// Middleware for parsing JSON
app.use(express.json());

// HTTP logging
app.use(morganMiddleware);

// Initialize Passport
app.use(passport.initialize());

// Error handling middleware


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Routes
app.get("/", (req, res) => {
  logger.info("Home route accessed");
  res.send("Hello from Express with Morgan + Winston!");
});

import userRouter from "./routes/apps/auth/user.route.js";
import roomRouter from './routes/apps/room/romm.routes.js';
import teamRouter from './routes/apps/team/team.route.js'
import questionRouter from './routes/apps/question/question.route.js'
import submitRouter from './routes/apps/submission/submission.route.js'
import solveRequestRouter from './routes/apps/solveRequest/solveRequet.route.js'

app.use("/api/v1/users", userRouter);
app.use('/api/v1/rooms',roomRouter);
app.use('/api/v1/teams',teamRouter);
app.use('/api/v1/questions',questionRouter);
app.use('/api/v1/submit',submitRouter);
app.use('/api/v1/solve-requests',solveRequestRouter)

app.use(errorHandler);
export default app;
