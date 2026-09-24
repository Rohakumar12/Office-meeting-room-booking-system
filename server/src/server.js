require('dotenv').config(); 
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`🏥 Health: http://localhost:${PORT}/health\n`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      console.log('✅ Server and MongoDB connection closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle unhandled rejections
  process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err.message);
    server.close(() => process.exit(1));
  });
};

startServer();
