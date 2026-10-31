require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { startGpsSimulator } = require('./services/gpsSimulatorService');
const { initCronReports } = require('./services/cronReportService');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Attach io instance to express app for controllers
app.set('io', io);

// Security & utility middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow inline styles & external maps/fonts
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiter for general API routes
app.use('/api', apiLimiter);

// Main API routes
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

// Socket.IO real-time connection handler
io.on('connection', (socket) => {
  console.log(`[Socket.IO] New client connected: ${socket.id}`);

  // Join user room for targeted notifications
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
  });

  // Join role room for broadcast announcements
  socket.on('join_role_room', (roleName) => {
    socket.join(`role_${roleName}`);
  });

  socket.on('disconnect', () => {
    // Client disconnected
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  🚀 LogiNaft Smart System API running on port ${PORT}`);
    console.log(`  🌍 Timezone: Africa/Algiers (UTC+1)`);
    console.log(`  🛡️  RBAC & Security: Active`);
    console.log(`=======================================================`);

    // Launch GPS Simulator for live demo
    startGpsSimulator(app);

    // Launch Automated Cron Smart Reports
    initCronReports();
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, server, io };
