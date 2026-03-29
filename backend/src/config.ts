import 'dotenv/config';

const config = {
  port: Number(process.env.PORT) || 3000,
  dbAddress: process.env.DB_ADDRESS || 'mongodb://127.0.0.1:27017/weblarek',
  uploadPath: process.env.UPLOAD_PATH || 'images',
  uploadPathTemp: process.env.UPLOAD_PATH_TEMP || 'temp',
  originAllow: process.env.ORIGIN_ALLOW || 'http://localhost:5173',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret-key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
  authAccessTokenExpiry: process.env.AUTH_ACCESS_TOKEN_EXPIRY || '10m',
  authRefreshTokenExpiry: process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d',
};

export default config;