import express from 'express';
import {
    likeMissionUpdate,
    getCommentsForUpdate,
    addComment,
    deleteComment
} from '../controllers/interactions.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

// Routes for actions on a specific Mission Update
router.route('/updates/:id/like').post(protect, likeMissionUpdate);
router.route('/updates/:id/comments').get(getCommentsForUpdate).post(protect, addComment);

// Route for actions on a specific Comment
router.route('/comments/:id').delete(protect, deleteComment);

export default router;
