import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import missionRoutes from './routes/missions.js';
import userRoutes from './routes/users.js';

dotenv.config({ quiet: true });

connectDB();

const app = express();

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
app.use('/api/v1/users', userRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
