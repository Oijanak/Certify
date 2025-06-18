const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register user with email verification
exports.register = async (req, res, next) => {
  const { name, email, password, publicAddress, rollNo, course } = req.body;
  console.log(req.body);

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new ErrorResponse("User already exist", 400));
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationExpires =
      Date.now() + process.env.EMAIL_VERIFICATION_EXPIRE_MINUTES * 60 * 1000;

    const user = await User.create({
      name,
      email,
      rollNo,
      course,
      password,
      publicAddress,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email
    const message = `
      <h1>Email Verification</h1>
      <p>Your verification code is: <strong>${verificationCode}</strong></p>
      <p>This code will expire in ${process.env.EMAIL_VERIFICATION_EXPIRE_MINUTES} minutes.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: "Email Verification Code",
      text: message,
    });

    res.status(201).json({
      success: true,
      message: `Verification code sent to ${email}. It will expire in ${process.env.EMAIL_VERIFICATION_EXPIRE_MINUTES} minutes.`,
    });
  } catch (err) {
    next(err);
  }
};

exports.sendVerify = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      next(new ErrorResponse("User doesn't exist", 400));
    }
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationExpires =
      Date.now() + process.env.EMAIL_VERIFICATION_EXPIRE_MINUTES * 60 * 1000;
    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = verificationExpires;
    await user.save();
    const message = `
   <h1>Email Verification</h1>
   <p>Your verification code is: <strong>${verificationCode}</strong></p>
   <p>This code will expire in ${process.env.EMAIL_VERIFICATION_EXPIRE_MINUTES} minutes.</p>
 `;

    await sendEmail({
      to: user.email,
      subject: "Email Verification Code",
      text: message,
    });
    res.status(201).json({
      success: true,
      message: `Verification code sent to ${email}. It will expire in ${process.env.EMAIL_VERIFICATION_EXPIRE_MINUTES} minutes.`,
    });
  } catch (err) {
    next(err);
  }
};
// Verify email with code
exports.verifyEmail = async (req, res, next) => {
  const { email } = req.query;
  const { code } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    if (user.isEmailVerified) {
      return next(new ErrorResponse("Email already verified", 400));
    }

    if (user.emailVerificationCode !== code) {
      return next(new ErrorResponse("Invalid verification code", 400));
    }

    if (Date.now() > user.emailVerificationExpires) {
      return next(new ErrorResponse("Verification code has expired", 400));
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (err) {
    next(err);
  }
};

// Login user
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    if (!user.isEmailVerified) {
      return next(new ErrorResponse("Email not verified", 401));
    }

    const token = generateToken(user._id);
    console.log(token);
    // Set cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 60 * 1000, // 30 minutes
    });

    await user.save();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse("Email could not be sent", 404));
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetPasswordExpire =
      Date.now() + process.env.PASSWORD_RESET_EXPIRE_MINUTES * 60 * 1000;

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    // Send email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const message = `
      <h1>Password Reset Request</h1>
      <p>Please click the following link to reset your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
      <p>This link will expire in ${process.env.PASSWORD_RESET_EXPIRE_MINUTES} minutes.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: message,
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (err) {
    next(err);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  const { password } = req.body;
  const resetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse("Invalid or expired token", 400));
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    next(err);
  }
};

// Logout user
exports.logout = async (req, res, next) => {
  try {
    res.clearCookie("token");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.email = (req, res, next) => {
  res.status(200).json({
    allowedDomains: ["ncit.edu.np"],
    courses: ["BE IT", "BE Computer", "BE Software", "BCA"],
  });
};

exports.getUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
