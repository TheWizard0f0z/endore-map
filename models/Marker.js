const mongoose = require('mongoose');

// Schemat dla znaczników
const markerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ID użytkownika
  title: { type: String, required: true }, // Nazwa znacznika
  group: { type: String, required: true }, // Grupa znacznika (np. "Miasto", "Arena")
  iconType: { type: String, required: true }, // Typ ikony (np. "miasto1")
  coordinates: { // Współrzędne geograficzne
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  createdAt: { type: Date, default: Date.now } // Data utworzenia
});

// Eksport modelu
module.exports = mongoose.model('Marker', markerSchema);
