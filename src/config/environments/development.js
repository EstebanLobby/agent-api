module.exports = {
    env: 'development',
    port: process.env.PORT || 3000,
    dbURI: process.env.MONGO_URI || 'mongodb://localhost:27017/tu-app-dev',
    jwtSecret: process.env.JWT_SECRET || 'dev-secret',
    enableSwagger: true,
    logLevel: 'debug',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      from: process.env.SMTP_FROM || 'noreply@tuapp.com',
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  };
  