import asyncHandler from "../middleware/asyncHandler.js";
import ErrorResponse from "../utils/errorResponse.js";
import MissionUpdate from "../models/MissionUpdate.js";

/**
 * @desc    Get all mission updates for admin review
 * @route   GET /api/v1/admin/updates
 * @access  Private (Admin only)
 */
export const getUpdatesForAdmin = asyncHandler(async (req, res, next) => {
  let query;

  const { status } = req.query;

  if (status) {
    query = MissionUpdate.find({ status: status });
  } else {
    query = MissionUpdate.find();
  }

  const updates = await query
    .populate("author", "username name")
    .populate("mission", "missionName slug")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: updates.length,
    data: updates,
  });
});

/**
 * @desc    Manage a mission update's status (approve/reject)
 * @route   PUT /api/v1/admin/updates/:id
 * @access  Private (Admin only)
 */
export const manageUpdateStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return next(
      new ErrorResponse(
        'Invalid status. Only "approved" or "rejected" are allowed.',
        400
      )
    );
  }

  const update = await MissionUpdate.findById(req.params.id);

  if (!update) {
    return next(
      new ErrorResponse(`Update not found with id of ${req.params.id}`, 404)
    );
  }

  update.status = status;
  await update.save();

  res.status(200).json({
    success: true,
    data: update,
  });
});
