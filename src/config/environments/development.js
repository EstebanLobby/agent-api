module.exports = {
    env: 'development',
    port: process.env.PORT || 3000,
    dbURI: process.env.MONGO_URI || 'mongodb://localhost:27017/tu-app-dev',
    jwtSecret: process.env.JWT_SECRET || 'dev-secret',
    enableSwagger: true,
    logLevel: 'debug',
  };
  