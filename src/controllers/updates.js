import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Mission from '../models/Mission.js';
import MissionUpdate from '../models/MissionUpdate.js';

/**
 * @desc    Add a new mission update (for a logged-in user)
 * @route   POST /api/v1/missions/:slug/updates
 * @access  Private
 */
export const addMissionUpdate = asyncHandler(async (req, res, next) => {
  const mission = await Mission.findOne({ slug: req.params.slug });

  if (!mission) {
    return next(new ErrorResponse(`Mission not found with slug of ${req.params.slug}`, 404));
  }

  req.body.mission = mission._id;
  req.body.author = req.user.id;

  const update = await MissionUpdate.create(req.body);

  res.status(201).json({
    success: true,
    data: update,
  });
});

/**
 * @desc    Get all approved mission updates for a single mission
 * @route   GET /api/v1/missions/:slug/updates
 * @access  Public
 */
export const getMissionUpdates = asyncHandler(async (req, res, next) => {
  const mission = await Mission.findOne({ slug: req.params.slug });

  if (!mission) {
    return next(new ErrorResponse(`Mission not found with slug of ${req.params.slug}`, 404));
  }

  const updates = await MissionUpdate.find({ 
    mission: mission._id, 
    status: 'approved' 
  })
  .populate('author', 'username name')
  .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: updates.length,
    data: updates,
  });
});

/**
 * @desc    Update a mission update
 * @route   PUT /api/v1/updates/:id
 * @access  Private
 */
export const updateMissionUpdate = asyncHandler(async (req, res, next) => {
  let update = await MissionUpdate.findById(req.params.id);

  if (!update) {
    return next(new ErrorResponse(`Mission update not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is the author
  if (update.author.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this mission update`, 401));
  }

  // Make sure update is pending
  if (update.status !== 'pending') {
      return next(new ErrorResponse(`Cannot edit an update that has already been reviewed`, 400));
  }

  update = await MissionUpdate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: update });
});

/**
 * @desc    Delete a mission update
 * @route   DELETE /api/v1/updates/:id
 * @access  Private
 */
export const deleteMissionUpdate = asyncHandler(async (req, res, next) => {
  const update = await MissionUpdate.findById(req.params.id);

  if (!update) {
    return next(new ErrorResponse(`Mission update not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is the author
  if (update.author.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to delete this mission update`, 401));
  }

  // Make sure update is pending
  if (update.status !== 'pending') {
      return next(new ErrorResponse(`Cannot delete an update that has already been reviewed`, 400));
  }

  await update.remove();

  res.status(200).json({ success: true, data: {} });
});
