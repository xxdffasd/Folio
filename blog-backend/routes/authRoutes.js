const express = require('express');
const router = express.Router();

const { register, login, logout, getMe } = require('../controllers/authController');
const validate = require('../middleware/validate');
const authenticateUser = require('../middleware/authenticateUser');
const { registerUserSchema, loginUserSchema } = require('../validations/userValidation');

router.post('/register', validate(registerUserSchema), register);
router.post('/login', validate(loginUserSchema), login);
router.post('/logout', logout);
router.get('/me', authenticateUser, getMe);

module.exports = router;
