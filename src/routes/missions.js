import express from 'express';
import {
  getMissions,
  getMission,
  getMissionTrackers,
  trackMission
} from '../controllers/missions.js';

const router = express.Router();

router.route('/').get(getMissions);
router.route('/:id').get(getMission);
router.route('/:id/trackedby').get(getMissionTrackers);
router.route('/track/:missionId').get(trackMission);

export default router;
