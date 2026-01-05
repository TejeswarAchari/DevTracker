// Jest setup file for global test configuration
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

module.exports = async () => {
  // Increase test timeout for MongoDB operations
  jest.setTimeout(30000);
};

// Start in-memory MongoDB before running tests
jest.mock('./config/db', () => {
  return jest.fn().mockResolvedValue(undefined);
});
