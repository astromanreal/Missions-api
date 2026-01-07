import User from '../models/User.js';
import Mission from '../models/Mission.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all tracked missions for a user
// @route   GET /api/v1/users/tracked-missions
// @access  Private
export const getTrackedMissions = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('trackedMissions');

  res.status(200).json({
    success: true,
    data: user.trackedMissions,
  });
});

// @desc    Toggle mission tracking for a user
// @route   PUT /api/v1/users/missions/:missionId/track
// @access  Private
export const toggleMissionTracking = asyncHandler(async (req, res, next) => {
  const missionId = req.params.missionId;
  const userId = req.user.id;

  const mission = await Mission.findById(missionId);
  if (!mission) {
    return next(new ErrorResponse(`Mission not found with id of ${missionId}`, 404));
  }

  const user = await User.findById(userId);

  const isTracking = user.trackedMissions.includes(missionId);

  if (isTracking) {
    // If already tracking, remove it
    user.trackedMissions = user.trackedMissions.filter(
      (id) => id.toString() !== missionId
    );
    await user.save();
    res.status(200).json({ success: true, data: 'Mission untracked' });
  } else {
    // If not tracking, add it
    user.trackedMissions.push(missionId);
    await user.save();
    res.status(200).json({ success: true, data: 'Mission tracked' });
  }
});
