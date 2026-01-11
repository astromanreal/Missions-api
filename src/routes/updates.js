import express from 'express';
import {
  addMissionUpdate,
  getMissionUpdates,
  updateMissionUpdate,
  deleteMissionUpdate,
} from '../controllers/updates.js';
import { protect } from '../middleware/auth.js';

// Using mergeParams to access the ':slug' from the parent router in index.js
const router = express.Router({ mergeParams: true });

// Corresponds to /api/v1/missions/:slug/updates
router
  .route('/')
  .get(getMissionUpdates)
  .post(protect, addMissionUpdate);

// Corresponds to /api/v1/missions/:slug/updates/:id
router
  .route('/:id')
  .put(protect, updateMissionUpdate)
  .delete(protect, deleteMissionUpdate);

export default router;
