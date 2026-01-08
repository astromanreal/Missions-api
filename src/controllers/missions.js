import Mission from '../models/Mission.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all missions
// @route   GET /api/v1/missions
// @access  Public
export const getMissions = async (req, res, next) => {
  try {
    const missions = await Mission.find();

    res.status(200).json({ 
      success: true, 
      count: missions.length, 
      data: missions 
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single mission
// @route   GET /api/v1/missions/:id
// @access  Public
export const getMission = async (req, res, next) => {
  try {
    const mission = await Mission.findById(req.params.id).populate('trackedBy', 'username name');

    if (!mission) {
      return next(new ErrorResponse('Mission not found', 404));
    }

    res.status(200).json({ 
      success: true, 
      data: mission 
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Track or untrack a mission
// @route   POST /api/v1/missions/:id/track
// @access  Private
export const trackMission = async (req, res, next) => {
  try {
    const missionId = req.params.id;
    const userId = req.user.id;

    const mission = await Mission.findById(missionId);
    const user = await User.findById(userId);

    if (!mission) {
      return next(new ErrorResponse('Mission not found', 404));
    }

    const isTracking = user.trackedMissions.includes(missionId);

    let message;

    if (isTracking) {
      // If already tracking, untrack
      await User.findByIdAndUpdate(userId, { $pull: { trackedMissions: missionId } });
      await Mission.findByIdAndUpdate(missionId, { $pull: { trackedBy: userId } });
      message = 'Mission untracked successfully';
    } else {
      // If not tracking, track
      await User.findByIdAndUpdate(userId, { $addToSet: { trackedMissions: missionId } });
      await Mission.findByIdAndUpdate(missionId, { $addToSet: { trackedBy: userId } });
      message = 'Mission tracked successfully';
    }

    res.status(200).json({ success: true, message });

  } catch (err) {
    next(err);
  }
};