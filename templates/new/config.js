const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  IS_PROD: isProduction,
  UI_URL: 'http://localhost:8080',
  PORT: isProduction ? process.env.PORT : 3001,
  PRODUCTS_FILE: 'products.json',
  UI: {
    SERVER_URL: isProduction ? 'https://dry-island-9288.herokuapp.com' : 'http://localhost:3001',
    API: 'api',
  },
};
