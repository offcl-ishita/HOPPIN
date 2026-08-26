// backend/routes/eateries.js
const express = require('express');
const router = express.Router();

// Initial dataset based on HOPPIN presentation
let srmEateries = [
  { id: '1', name: 'Tech Park Canteen', location: 'Tech Park', liveCrowd: '92% (High Queue)', isFavorite: false },
  { id: '2', name: 'Java Green Food Court', location: 'Java Green Area', liveCrowd: '78% (Moderate)', isFavorite: false },
  { id: '3', name: 'UB Ground Canteen', location: 'University Building', liveCrowd: '65% (Brisk Movement)', isFavorite: false },
  { id: '4', name: 'SubWay', location: 'Main Food Court', liveCrowd: '40% (Low Queue)', isFavorite: false },
  { id: '5', name: 'Campus Food Trucks', location: 'Near Hostels / TP', liveCrowd: '50% (Moderate)', isFavorite: false }
];

// GET: Fetch all SRM KTR eateries
router.get('/api/eateries', (req, res) => {
  res.status(200).json({ success: true, data: srmEateries });
});

// POST: Toggle favorite status for an eatery
router.post('/api/eateries/:id/favorite', (req, res) => {
  const { id } = req.params;
  const eatery = srmEateries.find((e) => e.id === id);

  if (!eatery) {
    return res.status(404).json({ success: false, message: 'Eatery not found' });
  }

  eatery.isFavorite = !eatery.isFavorite;
  return res.status(200).json({ success: true, data: eatery });
});

module.exports = router;