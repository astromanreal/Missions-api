import Mission from '../models/Mission.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all missions with advanced filtering
// @route   GET /api/v1/missions
// @access  Public
export const getMissions = async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/(gt|gte|lt|lte|in)/g, match => `$${match}`);
    
    let queryObj = JSON.parse(queryStr);

    // Handle single-field filters (status, destination)
    if (req.query.status) {
      queryObj.missionStatus = req.query.status;
    }
    if (req.query.destination) {
      queryObj.destination = req.query.destination;
    }
    if (req.query.category) {
      queryObj.category = req.query.category;
    }
    
    // Handle nested field filter (owner)
    if (req.query.owner) {
      queryObj['agency.name'] = req.query.owner;
    }

    // Text Search (on missionName and objectives)
    if (req.query.search) {
      queryObj.$or = [
        { missionName: { $regex: req.query.search, $options: 'i' } },
        { objectives: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Finding resource
    query = Mission.find(queryObj);

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      if (sortBy.includes('launchDate')) {
          const sortOrder = sortBy.startsWith('-') ? -1 : 1;
          query = query.sort({ 'launch.launchDate': sortOrder });
      } else {
          query = query.sort(sortBy);
      }
    } else {
      query = query.sort({ 'launch.launchDate': -1 });
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Mission.countDocuments(queryObj);

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const missions = await query;

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: missions.length,
      pagination,
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

// @desc    Get unique filter options for missions
// @route   GET /api/v1/missions/filters
// @access  Public
export const getMissionFilters = async (req, res, next) => {
  try {
    const destinations = await Mission.distinct('destination');
    const statuses = await Mission.distinct('missionStatus');
    const owners = await Mission.distinct('agency.name');
    const categories = await Mission.distinct('category');

    // Filter out any null or empty string values that might be in the DB
    const clean = (arr) => arr.filter(item => item);

    res.status(200).json({
      success: true,
      data: {
        destinations: clean(destinations),
        statuses: clean(statuses),
        owners: clean(owners),
        categories: clean(categories)
      }
    });
  } catch (err) {
    next(err);
  }
};
