import express from 'express';
import { getMissions, getMission, trackMission, getMissionFilters } from '../controllers/missions.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getMissions);
router.route('/filters').get(getMissionFilters);
router.route('/:slug').get(getMission);
router.route('/:id/track').post(protect, trackMission);

export default router;