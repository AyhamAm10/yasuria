import { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: swaggerJsdoc.Options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Express with typeOrm",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  servers: [
    {
      url: "http://localhost:3000/",
    },
  ],
  
  apis: [
    "./src/swagger/auth.docs.yaml",
    "./src/swagger/specification.docs.yaml",
    "./src/swagger/car.docs.yaml",
    "./src/swagger/property.docs.yaml",
    "./src/swagger/attribute.docs.yaml",
    "./src/swagger/office.docs.yaml",
  ],
};


const swaggerSpec = swaggerJsdoc(options);


function swaggerDoc(app: Express) {
  app.use("/docs", swaggerUi.serve, (req, res, next) => 
    swaggerUi.setup(swaggerSpec)(req, res, next)
  );

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

}

export { swaggerDoc };
