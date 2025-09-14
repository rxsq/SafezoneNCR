module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_STORAGE: process.env.DB_STORAGE || './data.sqlite',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-me',
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  JWT_COOKIE_NAME: process.env.JWT_COOKIE_NAME || 'sid',
  JWT_EXPIRES_SEC: Number(process.env.JWT_EXPIRES_SEC || 60 * 60 * 8)
};
