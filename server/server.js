const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/export', require('./routes/export'));

// Root Index Endpoint (Working Page)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FinTrack API</title>
        <style>
            body { margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; background-color: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; }
            .card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 40px; text-align: center; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); backdrop-filter: blur(5px); }
            h1 { margin: 0 0 10px 0; font-size: 24px; font-weight: 600; background: linear-gradient(to right, #3b82f6, #8b5cf6); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
            p { margin: 0; color: #94a3b8; font-size: 14px; }
            .status { margin-top: 20px; display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 6px 12px; border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.2); }
            .dot { width: 8px; height: 8px; background-color: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; animation: pulse 2s infinite; }
            @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>FinTrack Backend API</h1>
            <p>Expense and Analytics Tracker Engine</p>
            <div class="status">
                <div class="dot"></div> Server is online and operational
            </div>
        </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    status: 'Server is running', 
    uptime: process.uptime() 
  });
});

// Custom Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
