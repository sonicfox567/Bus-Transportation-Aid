const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB, sequelize } = require('./config/db');

// Load models to ensure associations are registered
require('./models');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/addresses', require('./routes/addressRoutes'));

// Root endpoint
app.get('/', (req, res) => {
  res.send('Lebanon Bus API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  // Sync database
  await sequelize.sync({ alter: true });
  console.log('Database synced.');

  // Optional: Seed initial data if routes are empty
  const { Route } = require('./models');
  const count = await Route.count();
  if (count === 0) {
    // Use real location seeder which will fallback to default if extracted_routes.json is not found
    const seedRealData = require('./seeders/realLocationSeeder');
    await seedRealData();
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
