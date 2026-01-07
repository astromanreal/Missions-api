import express from 'express';
import { getTrackedMissions, toggleMissionTracking } from '../controllers/users.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes in this file are protected
router.use(protect);

router.route('/tracked-missions').get(getTrackedMissions);
router.route('/missions/:missionId/track').put(toggleMissionTracking);

export default router;
