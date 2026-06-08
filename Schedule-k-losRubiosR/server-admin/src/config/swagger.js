import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Appointments API - Scheduled-K",
      version: "1.0.0",
      description: "API para gestión de citas en Scheduled-K.",
      contact: {
        name: "Equipo Scheduled-K",
        email: "soporte@fundacionkinal.org",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
        description: "Server Admin local"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Pegue aquí el token JWT del login de auth-service. No agregue el prefijo Bearer; Swagger lo envía automáticamente."
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    path.join(__dirname, "../controllers/appointment.controller.js"),
    path.join(__dirname, "../controllers/notification.controller.js")
  ],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.get("/api-docs/swagger.json", (req, res) => res.json(specs));

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(null, {
      swaggerOptions: {
        urls: [
          { url: "/api-docs/swagger.json", name: "Server Admin API" },
          { url: "http://localhost:5066/swagger/v1/swagger.json", name: "Auth Service API" }
        ],
      },
    })
  );
};