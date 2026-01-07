import express from 'express';
import { getMissions, getMission } from '../controllers/missions.js';

const router = express.Router();

router.route('/').get(getMissions);
router.route('/:id').get(getMission);

export default router;