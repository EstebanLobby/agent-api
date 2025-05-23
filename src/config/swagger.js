const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require('path');

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
        url: "http://localhost:5000",
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
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.js'),
    path.join(__dirname, '../models/*.js')
  ],
};

const swaggerSpec = swaggerJsdoc(options);

// Asegurarnos de que la especificación sea válida
const validSpec = {
  openapi: "3.0.0",
  info: swaggerSpec.info,
  servers: swaggerSpec.servers,
  components: swaggerSpec.components,
  security: swaggerSpec.security,
  paths: swaggerSpec.paths || {},
  tags: swaggerSpec.tags || []
};

// Función para filtrar rutas según el rol
const filterPathsByRole = (spec, userRole) => {
  console.log('🔍 Filtrando rutas para rol:', userRole);
  
  const filteredPaths = {};
  const filteredTags = new Set();

  Object.entries(spec.paths).forEach(([path, methods]) => {
    const filteredMethods = {};
    let shouldIncludePath = false;

    Object.entries(methods).forEach(([method, details]) => {
      // Verificar si la ruta tiene restricción de roles
      const roles = details['x-roles'] || [];
      console.log(`📝 Ruta ${path} (${method}) - Roles permitidos:`, roles);
      
      // Si no hay restricción de roles o el usuario tiene el rol permitido
      if (roles.length === 0 || roles.includes(userRole)) {
        filteredMethods[method] = details;
        shouldIncludePath = true;
        console.log(`✅ Ruta ${path} (${method}) - Incluida para rol ${userRole}`);
        
        // Agregar tags asociados a esta ruta
        if (details.tags) {
          details.tags.forEach(tag => filteredTags.add(tag));
        }
      } else {
        console.log(`❌ Ruta ${path} (${method}) - Excluida para rol ${userRole}`);
      }
    });

    if (shouldIncludePath) {
      filteredPaths[path] = filteredMethods;
    }
  });

  const result = {
    ...spec,
    paths: filteredPaths,
    tags: Array.from(filteredTags).map(tag => ({
      name: tag,
      description: spec.tags?.find(t => t.name === tag)?.description || ''
    }))
  };

  console.log('📊 Resumen de rutas filtradas:', {
    totalRutas: Object.keys(spec.paths).length,
    rutasFiltradas: Object.keys(filteredPaths).length,
    tags: Array.from(filteredTags)
  });

  return result;
};

const swaggerDocs = (app) => {
  // ⚠️ IMPORTANTE: La ruta específica debe ir ANTES que la general
  
  // Servir el JSON de Swagger PRIMERO
  app.get("/api-docs/swagger.json", (req, res) => {
    console.log('🌐 Petición recibida para swagger.json');
    console.log('🔑 Query parameters:', req.query);
    
    // Obtener el rol del query parameter
    const userRole = req.query.role;
    
    if (!userRole) {
      console.log('❌ Error: No se proporcionó el parámetro role');
      return res.status(400).json({ 
        error: 'Role parameter is required',
        message: 'Por favor, proporciona un rol válido (admin, owner, member)'
      });
    }

    console.log('✅ Rol recibido:', userRole);

    // Filtrar las rutas según el rol
    const filteredSpec = filterPathsByRole(validSpec, userRole);

    res.setHeader("Content-Type", "application/json");
    res.json(filteredSpec);
  });

  // Servir la documentación de Swagger UI DESPUÉS
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(validSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "LobbyBot API Documentation",
  }));

  // Log para verificar que las rutas se están encontrando
  console.log('🔍 Rutas encontradas para Swagger:', validSpec.paths ? Object.keys(validSpec.paths) : 'No se encontraron rutas');
};

module.exports = swaggerDocs;
