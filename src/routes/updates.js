import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Placeholder for controllers - we will create these next
import { addMissionUpdate, getMissionUpdates } from '../controllers/updates.js'; 

router.route('/').post(protect, addMissionUpdate);
router.route('/').get(getMissionUpdates);

export default router;
