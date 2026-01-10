import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Import the cors package
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import missionRoutes from './routes/missions.js';
import updateRoutes from './routes/updates.js';
import adminRoutes from './routes/admin.js';
import errorHandler from './middleware/errorHandler.js'; // Import the error handler

dotenv.config({ quiet: true });

connectDB();

const app = express();

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Welcome to the API!',
    status: 'success',
    documentation_url: 'coming soon' // Placeholder for future docs
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/v1/missions', missionRoutes);
app.use('/api/v1/missions/:slug/updates', updateRoutes)
app.use('/api/v1/admin', adminRoutes);

// Use the error handler
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
