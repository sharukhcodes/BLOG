// server.js
// Entry point: sets up the Express app and starts it for local development.
require('dotenv').config(); // loads MONGO_URI and PORT from the .env file

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const blogRoutes = require('./routes/blogRoutes');

const app = express();
const MONGO_URI = process.env.MONGO_URI;
let databaseConnection;

// ---------- Middleware ----------
app.use(express.json()); // lets Express read JSON sent in request bodies
app.use(express.static(path.join(__dirname, 'public'))); // serves the HTML/CSS/JS files

// ---------- Routes ----------
async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return;
  if (!MONGO_URI) throw new Error('MONGO_URI is missing. Set it in your environment.');

  if (!databaseConnection) {
    databaseConnection = mongoose.connect(MONGO_URI).catch((err) => {
      databaseConnection = undefined;
      throw err;
    });
  }
  await databaseConnection;
}

app.use('/api/posts', async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api/posts', blogRoutes);

// Any unknown /api URL gets a JSON 404 (instead of an HTML page).
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// ---------- Error handler ----------
// Express recognises this as an error handler because it has 4 parameters.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.message);

  // Broken JSON in the request body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }
  // Mongoose validation failed (e.g. title too long)
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }
  // Anything else is an unexpected server problem
  res.status(500).json({ message: 'Something went wrong on the server' });
});

// ---------- Start ----------
async function start() {
  try {
    await connectToDatabase();
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT || 5000, () => {
      const PORT = process.env.PORT || 5000;
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  }
}

if (require.main === module) start();

module.exports = app;
