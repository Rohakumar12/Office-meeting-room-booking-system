const authService = require('../services/authService');
const ApiResponse = require('../utils/ApiResponse');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    authService.sendTokenResponse(user, 201, res, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password);
    authService.sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user._id);
    return res.status(200).json(new ApiResponse(200, { user }, 'User profile retrieved'));
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getMe };
