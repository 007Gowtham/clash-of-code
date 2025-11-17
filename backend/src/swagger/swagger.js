// src/swagger/swagger.js
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Clash of Code API",
      version: "1.0.0",
      description: "API documentation for Clash of Code backend",
    },
    servers: [
      {
        url: "http://localhost:3000", // your server URL
      },
    ],
  },
  // 👇 IMPORTANT: from CWD=backend, routes live in ./src/routes/...
  apis: ["./src/routes/apps/**/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

console.log("CWD:", process.cwd());
console.log("Swagger paths:", Object.keys(swaggerSpec.paths || {}));

export { swaggerUi, swaggerSpec };
