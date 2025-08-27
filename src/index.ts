import express from "express";
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
import requesteRouter from "./routes/request.router";
import carTypeRouter from "./routes/carTyoe.router";
import propertyTypeRouter from "./routes/propertyTyoe.router";
import specificationRouter from "./routes/specification.router";
import SearchRouter from "./routes/searchRouter";
import profileRouter from "./routes/profile.router";
import officeProtfolioRouter from "./routes/officeProtfolio.router";
import favoriteRoute from "./routes/favorite.route";
import governorateRouter from "./routes/governorate.route";
import notificationRoutes from "./routes/notification";
import feedbackRouter from "./routes/feedback.route";
import userRoute from "./routes/user.route";
import { createServer } from "http";
import { initChatSocket } from "./chat/soket";
import chatRouter from "./routes/chat.route";
import ImageRouter from "./routes/image.route";




dotenv.config();
const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));



app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/icons', express.static(path.join(__dirname, 'public/icons')));

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
router.use("/specifications", specificationRouter);
router.use("/broker-offices", officeRouter);
router.use("/broker-portfolios", officeProtfolioRouter);
router.use("/products", productsRouter);
router.use("/requests", requesteRouter);
router.use("/type-c", carTypeRouter);
router.use("/type-p", propertyTypeRouter);
router.use("/search", SearchRouter);
router.use("/user", profileRouter);
router.use("/feedback", feedbackRouter);
router.use("/favorite", favoriteRoute);
router.use("/governorates", governorateRouter);
app.use("/notifications", notificationRoutes);
app.use("/user", userRoute);
app.use("/chat", chatRouter);
app.use("/image", ImageRouter);
app.use(process.env.BASE_URL, router);

app.use(errorHandler);
const PORT = Number(process.env.PORT);
swaggerDoc(app);
logger.info(`NODE_ENV: ${Environment.toString()}`);

const httpServer = createServer(app);



if (Environment.isDevelopment() || Environment.isProduction()) {
  AppDataSource.initialize()
    .then(async (connection) => {
      logger.info(
        `Database connection status: ${
          connection.isInitialized ? "Connected" : "Not Connected"
        }`
      );

      await createSuperAdmin();
      initChatSocket(httpServer);

      httpServer.listen(PORT ,'0.0.0.0', () => {
        logger.info(`Server running at http://localhost:${PORT}`);
      });
    })
    .catch((error: Error) => {
      logger.error(error);
    });
}

export { app };
