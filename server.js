const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');
const Marker = require('./models/Marker'); // Import modelu Marker

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
    const token = req.headers['authorization']?.split(' ')[1];
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

// Testowy endpoint do pobierania znaczników
app.get('/test-markers', async (req, res) => {
    try {
        const markers = await Marker.find(); // Pobiera wszystkie znaczniki z bazy
        res.json(markers);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching markers', error: err });
    }
});

// Endpointy CRUD dla znaczników

// Pobieranie znaczników zalogowanego użytkownika
app.get('/markers', authenticate, async (req, res) => {
    try {
        const markers = await Marker.find({ userId: req.user._id }); // Pobiera znaczniki tylko zalogowanego użytkownika
        res.json(markers);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching markers', error: err });
    }
});

// Dodawanie nowego znacznika
app.post('/markers', authenticate, async (req, res) => {
    try {
        const { title, group, iconType, coordinates } = req.body;

        const marker = new Marker({
            userId: req.user._id, // ID zalogowanego użytkownika
            title,
            group,
            iconType,
            coordinates
        });

        await marker.save();
        res.status(201).json(marker); // Zwraca zapisany znacznik
    } catch (err) {
        res.status(400).json({ message: 'Error creating marker', error: err });
    }
});

// Edycja znacznika
app.put('/markers/:id', authenticate, async (req, res) => {
    try {
        const { title, group, iconType, coordinates } = req.body;

        const marker = await Marker.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id }, // Znacznik musi należeć do użytkownika
            { title, group, iconType, coordinates },
            { new: true } // Zwróć zaktualizowany dokument
        );

        if (!marker) return res.status(404).json({ message: 'Marker not found' });
        res.json(marker);
    } catch (err) {
        res.status(400).json({ message: 'Error updating marker', error: err });
    }
});

// Usuwanie znacznika
app.delete('/markers/:id', authenticate, async (req, res) => {
    try {
        const marker = await Marker.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

        if (!marker) return res.status(404).json({ message: 'Marker not found' });
        res.json({ message: 'Marker deleted' });
    } catch (err) {
        res.status(400).json({ message: 'Error deleting marker', error: err });
    }
});

// Trasa chroniona
app.get('/protected', authenticate, (req, res) => {
    res.json({ message: 'This is protected data' });
});

// Start serwera
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
