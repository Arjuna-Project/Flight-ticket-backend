const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

router.post('/register', validateMiddleware(registerSchema), authController.register);
router.post('/login', validateMiddleware(loginSchema), authController.login);
router.get('/me', require('../middlewares/auth.middleware'), authController.getMe);

module.exports = router;
