/* ============================================
   SERVER.JS — Express App Entry Point
   Smart Citizen Grievance Management System
   ============================================ */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const config = require('./config/config');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// ---- Route Imports ----
const authRoutes = require('./routes/authRoutes');
const citizenRoutes = require('./routes/citizenRoutes');
const officerRoutes = require('./routes/officerRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

const app = express();

// ---- Global Middleware ----
app.use(cors({
  origin: config.client.url,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// ---- Static Files (uploaded complaint images) ----
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/css',express.static(path.join(__dirname,'..','css')));
app.use('/js',express.static(path.join(__dirname,'..','js')));
app.use(express.static(path.join(__dirname,'..')));
// ---- Health Check ----
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'..','index.html'));
});

// ---- API Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/citizens', citizenRoutes);
app.use('/api/officers', officerRoutes);
app.use('/api/complaints', complaintRoutes);

// ---- 404 + Error Handlers (must be last) ----
app.use(notFound);
app.use(errorHandler);

// ---- Start Server ----
connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`\n🏛️  Smart Citizen Grievance Management System API`);
    console.log(`🚀  Server running in ${config.nodeEnv} mode on port ${config.port}`);
    console.log(`🔗  http://localhost:${config.port}/\n`);
  });
});

module.exports = app;
