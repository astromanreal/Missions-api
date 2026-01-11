import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import MissionUpdate from '../models/MissionUpdate.js';
import Comment from '../models/Comment.js';

// @desc    Like or unlike a mission update
// @route   POST /api/v1/updates/:id/like
// @access  Private
export const likeMissionUpdate = asyncHandler(async (req, res, next) => {
    const missionUpdate = await MissionUpdate.findById(req.params.id);

    if (!missionUpdate) {
        return next(new ErrorResponse(`Mission update not found with id of ${req.params.id}`, 404));
    }

    const likedIndex = missionUpdate.likes.indexOf(req.user.id);

    if (likedIndex > -1) {
        // Already liked, so unlike it
        missionUpdate.likes.splice(likedIndex, 1);
    } else {
        // Not liked, so like it
        missionUpdate.likes.push(req.user.id);
    }

    await missionUpdate.save();

    res.status(200).json({ success: true, data: missionUpdate.likes });
});

// @desc    Get all comments for a mission update
// @route   GET /api/v1/updates/:id/comments
// @access  Public
export const getCommentsForUpdate = asyncHandler(async (req, res, next) => {
    const missionUpdate = await MissionUpdate.findById(req.params.id);

    if (!missionUpdate) {
        return next(new ErrorResponse(`Mission update not found with id of ${req.params.id}`, 404));
    }

    const comments = await Comment.find({ missionUpdate: req.params.id, parentComment: null })
        .populate('author', 'username name')
        .populate({
            path: 'replies',
            populate: { path: 'author', select: 'username name' }
        })
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: comments.length, data: comments });
});

// @desc    Add a comment or reply to a mission update
// @route   POST /api/v1/updates/:id/comments
// @access  Private
export const addComment = asyncHandler(async (req, res, next) => {
    req.body.author = req.user.id;
    req.body.missionUpdate = req.params.id;

    const missionUpdate = await MissionUpdate.findById(req.params.id);
    if (!missionUpdate) {
        return next(new ErrorResponse(`Mission update not found with id of ${req.params.id}`, 404));
    }

    const comment = await Comment.create(req.body);

    // If it's a reply, add it to the parent comment's replies array
    if (req.body.parentComment) {
        const parentComment = await Comment.findById(req.body.parentComment);
        if (parentComment) {
            parentComment.replies.push(comment._id);
            await parentComment.save();
        }
    }

    res.status(201).json({ success: true, data: comment });
});

// @desc    Delete a comment
// @route   DELETE /api/v1/comments/:id
// @access  Private
export const deleteComment = asyncHandler(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
        return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is the author
    if (comment.author.toString() !== req.user.id) {
        return next(new ErrorResponse('User not authorized to delete this comment', 401));
    }

    await comment.deleteOne();

    res.status(200).json({ success: true, data: {} });
});
