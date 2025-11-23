// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import connectDB from './config/db.js';
// import authRoutes from './routes/authRoutes.js';
// import teamRoutes from './routes/teamRoutes.js';
// import taskRoutes from './routes/taskRoutes.js';

// dotenv.config();

// const app = express();

// connectDB();

// // app.use(cors());
// app.use(cors({
//   // origin: 'http://localhost:5173', // for local testing
//   origin: 'https://remote-work-collaboration-tool.vercel.app', // production client URL
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
// app.use(express.json());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static('uploads'));

// app.use('/api/auth', authRoutes);
// app.use('/api/teams', teamRoutes);
// app.use('/api/tasks', taskRoutes);

// app.get('/', (req, res) => {
//   res.json({ message: 'Remote Work Management System API is running...' });
// });

// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });






import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

dotenv.config();

const app = express();

connectDB();

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://remote-work-collaboration-tool.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Remove or update the uploads static serving since we're using Cloudinary
app.use('/uploads', (req, res) => {
  res.status(404).json({ 
    message: 'File not found. Files are stored in Cloudinary.' 
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Remote Work Management System API is running...',
    environment: process.env.NODE_ENV || 'development'
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});