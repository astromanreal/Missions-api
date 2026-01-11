import User from '../models/User.js';
import MissionUpdate from '../models/MissionUpdate.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';
import { spaceUsernames } from '../utils/usernames.js';
import asyncHandler from '../middleware/asyncHandler.js';

// Helper function to generate a unique username
const generateUniqueUsername = async () => {
    let username;
    let isUnique = false;
    while (!isUnique) {
        const baseName = spaceUsernames[Math.floor(Math.random() * spaceUsernames.length)];
        const randomNumber = Math.floor(100 + Math.random() * 900);
        username = `${baseName}${randomNumber}`;
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (!existingUser) {
            isUnique = true;
        }
    }
    return username;
};

const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const lowercasedEmail = email.toLowerCase();
  let user = await User.findOne({ email: lowercasedEmail });
  if (user) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const username = await generateUniqueUsername();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  user = new User({ username, email: lowercasedEmail, password, otp, otpExpires });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);

  await user.save();

  try {
    await sendEmail({
      email: user.email,
      subject: 'Welcome! Please Verify Your Email',
      message: otp,
    });
    res.status(200).json({ msg: 'OTP sent to email. Welcome aboard!' });
  } catch (err) {
    res.status(500).json({ error: 'User registered, but failed to send verification email. Please try again.' });
  }
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  let user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(404).json({ error: 'No user found for this email. Please register first.' });
  }

  if (user.otp !== otp || user.otpExpires < Date.now()) {
    return res.status(400).json({ error: 'The OTP you entered is invalid or has expired.' });
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save();

  try {
    await sendEmail({
      type: 'welcome',
      email: user.email,
      subject: `Welcome to the Crew, ${user.username}! `,
      context: {
        username: user.username,
        websiteLink: 'https://astro-missions.vercel.app/',
      },
    });
  } catch (emailErr) {
  }

  const payload = { user: { id: user.id } };
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
    if (err) {
      return res.status(500).json({ error: 'Account verified, but failed to create a session. Please try logging in.' });
    }
    res.json({ token });
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(400).json({ error: 'The email or password you entered is incorrect.' });
  }

  if (!user.isVerified) {
    return res.status(403).json({ error: 'This account is not verified. Please check your email for the verification OTP.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: 'The email or password you entered is incorrect.' });
  }

  const payload = { user: { id: user.id } };
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
    if (err) throw err;
    res.json({ token });
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('-password')
    .populate('trackedMissions')
    .populate('followers', 'username name')
    .populate('following', 'username name');
  res.json(user);
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username })
    .select('-password -otp -otpExpires')
    .populate('trackedMissions')
    .populate('followers', 'username name')
    .populate('following', 'username name');
  if (!user) {
    return res.status(404).json({ error: 'This user profile could not be found.' });
  }
  res.json(user);
});

const logout = (req, res) => {
  res.json({ msg: 'User logged out successfully' });
};

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(404).json({ error: 'No account is associated with this email address.' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message: otp,
    });
    res.status(200).json({ msg: 'OTP for password reset has been sent to your email.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send password reset email. Please try again later.' });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(404).json({ error: 'No account is associated with this email address.' });
  }

  if (user.otp !== otp || user.otpExpires < Date.now()) {
    return res.status(400).json({ error: 'The OTP you entered is invalid or has expired.' });
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save();

  res.status(200).json({ msg: 'Your password has been reset successfully.' });
});

const updateMe = asyncHandler(async (req, res) => {
  const { username, name, bio } = req.body;
  const userId = req.user.id;

  if (username) {
    const usernameRegex = /^[a-z0-9]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ error: 'Username can only contain lowercase letters and numbers.' });
    }

    const lowercasedUsername = username.toLowerCase();
    const existingUser = await User.findOne({ username: lowercasedUsername, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({ error: 'This username is already taken. Please choose another.' });
    }
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  user.username = username || user.username;
  user.name = name || user.name;
  user.bio = bio || user.bio;

  await user.save();

  const updatedUser = await User.findById(userId).select('-password');
  res.json(updatedUser);
});

const followUser = asyncHandler(async (req, res) => {
  const userToFollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user.id);

  if (!userToFollow || !currentUser) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'You cannot follow yourself.' });
  }

  const isFollowing = currentUser.following.includes(req.params.id);

  if (isFollowing) {
    await User.findByIdAndUpdate(req.user.id, { $pull: { following: req.params.id } });
    await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user.id } });
    res.json({ msg: 'User unfollowed successfully.' });
  } else {
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { following: req.params.id } });
    await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user.id } });
    res.json({ msg: 'User followed successfully.' });
  }
});

export const getMyUpdates = asyncHandler(async (req, res, next) => {
  const updates = await MissionUpdate.find({ author: req.user.id })
    .populate('mission', 'name slug') // Populate mission details
    .sort({ createdAt: -1 });

  res.status(200).json({ 
    success: true, 
    count: updates.length,
    data: updates 
  });
});

export { register, login, getMe, verifyOTP, getUser, logout, forgotPassword, resetPassword, updateMe, followUser };
