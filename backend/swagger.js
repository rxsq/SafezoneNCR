const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");

const apiUrl = process.env.API_URL || "http://localhost:3001";

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "SafezoneNCR API Documentation", version: "1.0.0" },
    servers: [{ url: apiUrl }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    path.join(__dirname, "src", "routes", "**", "*.js"),
    // path.join(__dirname, "src", "controllers", "**", "*.js"),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec };
