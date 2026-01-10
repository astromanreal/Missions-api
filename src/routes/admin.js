import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authz.js';

const router = express.Router();

// Placeholder for controllers - we will create these next
import { getUpdatesForAdmin, manageUpdateStatus } from '../controllers/admin.js';

// All routes in this file are for admins only
router.use(protect, authorize('admin'));

router.route('/updates').get(getUpdatesForAdmin);
router.route('/updates/:id').put(manageUpdateStatus);

export default router;
