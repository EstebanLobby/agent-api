const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LobbyBot API",
      version: "1.0.0",
      description: "Documentación de la API de LobbyBot",
    },
    servers: [
      {
        url: "https://checkia.lobby-digital.com",
        description: "Servidor Local",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

// ✅ Definir `swaggerSpec` antes de usarlo
const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // ✅ Agregar endpoint para servir el JSON de Swagger
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log("📄 Swagger Docs disponible en: https://checkia.lobby-digital.com/api-docs");
  console.log(
    "📄 Swagger JSON disponible en: https://checkia.lobby-digital.com/api-docs.json"
  );
};

module.exports = swaggerDocs;
