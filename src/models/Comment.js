import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Please add some content to your comment'],
        trim: true,
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    missionUpdate: {
        type: mongoose.Schema.ObjectId,
        ref: 'MissionUpdate',
        required: true,
    },
    parentComment: {
        type: mongoose.Schema.ObjectId,
        ref: 'Comment',
        default: null, // This being null means it's a top-level comment
    },
    replies: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Comment',
        },
    ],
    likes: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('Comment', CommentSchema);
