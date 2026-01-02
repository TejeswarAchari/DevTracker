require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db'); // <--- This now works
const cors = require('cors');

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api', require('./routes/api'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));