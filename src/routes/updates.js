import express from 'express';
import {
  addMissionUpdate,
  getMissionUpdates,
  updateMissionUpdate,
  deleteMissionUpdate,
} from '../controllers/updates.js';
import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(protect, addMissionUpdate)
  .get(getMissionUpdates);

router
  .route('/:id')
  .put(protect, updateMissionUpdate)
  .delete(protect, deleteMissionUpdate);

export default router;
