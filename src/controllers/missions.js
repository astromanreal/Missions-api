import Mission from '../models/Mission.js';
import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all missions
// @route   GET /api/v1/missions
// @access  Public
export const getMissions = asyncHandler(async (req, res, next) => {
  const missions = await Mission.find();

  res.status(200).json({
    success: true,
    count: missions.length,
    data: missions,
  });
});

// @desc    Get single mission
// @route   GET /api/v1/missions/:id
// @access  Public
export const getMission = asyncHandler(async (req, res, next) => {
  const mission = await Mission.findById(req.params.id);

  if (!mission) {
    return next(
      new ErrorResponse(`Mission not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: mission,
  });
});

// @desc    Get all users tracking a single mission
// @route   GET /api/v1/missions/:id/trackedby
// @access  Public
export const getMissionTrackers = asyncHandler(async (req, res, next) => {
  const mission = await Mission.findById(req.params.id);

  if (!mission) {
    return next(
      new ErrorResponse(`Mission not found with id of ${req.params.id}`, 404)
    );
  }

  const users = await User.find({ trackedMissions: req.params.id }).select(
    'name username'
  );

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Track single mission
// @route   GET /api/v1/missions/track/:missionId
// @access  Public
export const trackMission = asyncHandler(async (req, res, next) => {
  const mission = await Mission.findOne({ missionId: req.params.missionId });

  if (!mission) {
    return next(
      new ErrorResponse(`Mission not found with id of ${req.params.missionId}`, 404)
    );
  }

  // Simulate real-time tracking data
  const trackingData = {
    missionId: mission.missionId,
    location: {
      j2000: {
        x: Math.random() * 1000000000,
        y: Math.random() * 1000000000,
        z: Math.random() * 1000000000,
      },
      distanceFromSun: Math.random() * 200000000,
      speed: Math.random() * 20,
    },
    lastUpdated: new Date().toISOString(),
  };

  res.status(200).json({
    success: true,
    data: trackingData,
  });
});
