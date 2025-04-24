module.exports = {
    env: 'production',
    port: process.env.PORT || 8080,
    dbURI: process.env.MONGO_URI, // se asume que está en tu .env de producción
    jwtSecret: process.env.JWT_SECRET,
    enableSwagger: false, // podés apagar la doc pública en prod
    logLevel: 'info',
  };
  