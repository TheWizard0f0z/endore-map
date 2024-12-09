const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000; // Port, na którym działa aplikacja
const MONGO_URI = 'mongodb+srv://user123:Qcq0nPLsZbshQXwM@cluster0.o1fen.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Wklej tutaj swoje URI z MongoDB Atlas

// Połączenie z MongoDB Atlas
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("MongoDB Atlas connection error:", err));

// Middleware autoryzacyjny
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Token required');
    
    try {
        const decoded = jwt.verify(token, 'my_secret_key'); // Zmień na swój sekret
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).send('Invalid token');
    }
};

// Trasy autoryzacji
app.use('/auth', authRoutes);

// Trasa chroniona
app.get('/protected', authenticate, (req, res) => {
    res.json({ message: 'This is protected data' });
});

// Start serwera
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
