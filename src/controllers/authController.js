import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user = new User({
      username,
      email,
      password,
      otp,
      otpExpires,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    try {
      await sendEmail({
        email: user.email,
        subject: "Email Verification",
        message: `Your OTP for verification is: ${otp}`,
      });
      res.status(200).json({ msg: "OTP sent to email" });
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Error sending email");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ msg: "Please verify your email to login" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get user profile by ID
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -otp -otpExpires"
    );
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(500).send("Server error");
  }
};

// Logout user
const logout = (req, res) => {
  // On the client-side, the token should be deleted.
  // This server-side endpoint is for acknowledging the logout.
  res.json({ msg: "User logged out successfully" });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset",
        message: `Your OTP for password reset is: ${otp}`,
      });
      res.status(200).json({ msg: "OTP sent to email" });
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Error sending email");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).json({ msg: "Password reset successful" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

export {
  register,
  login,
  getMe,
  verifyOTP,
  getUser,
  logout,
  forgotPassword,
  resetPassword,
};
