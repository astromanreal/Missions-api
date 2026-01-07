import Mission from '../models/Mission.js';

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
    const mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Mission not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: mission 
    });
  } catch (err) {
    next(err);
  }
};