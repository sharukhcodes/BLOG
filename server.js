// server.js
// Entry point: sets up Express, connects to MongoDB and starts listening.
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config(); // loads MONGO_URI and PORT from the .env file

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const blogRoutes = require('./routes/blogRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ---------- Middleware ----------
app.use(express.json()); // lets Express read JSON sent in request bodies
app.use(express.static(path.join(__dirname, 'public'))); // serves the HTML/CSS/JS files

// ---------- Routes ----------
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
  if (!MONGO_URI) {
    console.error('MONGO_URI is missing. Copy .env.example to .env and set it.');
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  }
}

start();
