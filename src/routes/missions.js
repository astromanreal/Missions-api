import express from 'express';
import { getMissions, getMission, trackMission, getMissionFilters, getMissionOfTheDay } from '../controllers/missions.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getMissions);
router.route('/filters').get(getMissionFilters);

// IMPORTANT: This route must come before the /:slug route
router.route('/motd').get(getMissionOfTheDay);

router.route('/:slug').get(getMission);
router.route('/:id/track').post(protect, trackMission);

export default router;