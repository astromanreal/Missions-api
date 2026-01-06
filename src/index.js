import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';

dotenv.config({ quiet: true });

connectDB();

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
