import express from 'express';
import { getMissions, getMission, trackMission } from '../controllers/missions.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getMissions);
router.route('/:id').get(getMission);
router.route('/:id/track').post(protect, trackMission);

export default router;