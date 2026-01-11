import express from 'express';
import {
    likeMissionUpdate,
    getCommentsForUpdate,
    addComment,
    deleteComment
} from '../controllers/interactions.js';

import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.route('/like').post(protect, likeMissionUpdate);
router.route('/comments').get(getCommentsForUpdate).post(protect, addComment);
router.route('/comments/:id').delete(protect, deleteComment);

export default router;
