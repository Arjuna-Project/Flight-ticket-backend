const authService = require('../services/auth.service');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');

const register = async (request, response) => {
  const payload = request.body;
  try {
    const { user, token } = await authService.registerUser(payload);
    if (!user || !token) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        message: "Failed to register user"
      });
    } else {
      return response.status(StatusCodes.CREATED).json({ user, token });
    }
  } catch (error) {
    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const login = async (request, response) => {
  const payload = request.body;
  try {
    const { user, token } = await authService.loginUser(payload);
    if (!user || !token) {
      return response.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid credentials"
      });
    } else {
      return response.status(StatusCodes.OK).json({ token, user });
    }
  } catch (error) {
    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const getMe = async (request, response) => {
  const id = request.user.id;
  try {
    const user = await authService.getUserById(id);
    if (!user) {
      return response.status(StatusCodes.NOT_FOUND).json({
        message: `User not found for id - ${id}`
      });
    } else {
      return response.status(StatusCodes.OK).json(user);
    }
  } catch (error) {
    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};
