import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { AppDataSource } from "./config/data_source";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.router";
import path = require("path");
import { errorHandler } from "./error/error.handler";
import { swaggerDoc } from "./helper/swaggerOptions";
import { Environment } from "./environment";
import { logger } from "./logging/logger";
import carRouter from "./routes/car.router";
import serviceRouter from "./routes/service.router";
import propertyRouter from "./routes/property.router";
import attributeRouter from "./routes/attribute.router";
import { createSuperAdmin } from "./config/createSuperAdmin";
import officeRouter from "./routes/office.router";
import serviceCategoryRouter from "./routes/serviceCategory.router";
import productsRouter from "./routes/products.router";



dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:8800",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


// handle files
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());
const router = express.Router();
router.get("/", (req, res) => {
  res.send("Our awesome Web API is online!");
});

router.use("/auth", authRouter);
router.use("/cars", carRouter);
router.use("/property", propertyRouter);
router.use("/service", serviceRouter);
router.use("/service-category", serviceCategoryRouter);
router.use("/attributes", attributeRouter);
router.use("/broker-offices", officeRouter);
router.use("/products", productsRouter);

app.use(process.env.BASE_URL, router);

app.use(errorHandler);
const PORT = Number(process.env.PORT);
swaggerDoc(app);
logger.info(`NODE_ENV: ${Environment.toString()}`);

if (Environment.isDevelopment() || Environment.isProduction()) {
  AppDataSource.initialize()
    .then(async (connection) => {
      logger.info(
        `Database connection status: ${
          connection.isInitialized ? "Connected" : "Not Connected"
        }`
      );

      await createSuperAdmin();

      app.listen(PORT ,'0.0.0.0', () => {
        logger.info(`Server running at http://localhost:${PORT}`);
      });
    })
    .catch((error: Error) => {
      logger.error(error);
    });
}

export { app };
