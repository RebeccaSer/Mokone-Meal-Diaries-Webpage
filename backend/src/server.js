const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();


const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Mokone Meal Diaries API!');
});

// start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});