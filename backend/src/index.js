import app from "./app.js";
import logger from "./logger/winston.logger.js";
import { connectDB } from "./db/index.js";
const PORT = process.env.PORT || 3000;

await connectDB();


app.listen(PORT, () => {
  logger.info(`🚀 Server is running on http://localhost:${PORT}`);
});
