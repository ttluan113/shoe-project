const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerUser = require('../controllers/users.controller');

router.post('/api/register', asyncHandler(controllerUser.register));
router.post('/api/login', asyncHandler(controllerUser.login));
router.get('/api/auth', authUser, asyncHandler(controllerUser.authUser));
router.get('/api/refresh-token', asyncHandler(controllerUser.refreshToken));
router.get('/api/logout', authUser, asyncHandler(controllerUser.logout));
router.post('/api/login-google', asyncHandler(controllerUser.loginGoogle));
router.post('/api/update-user', authAdmin, asyncHandler(controllerUser.updateUser));

router.get('/api/product-sell', authAdmin, asyncHandler(controllerUser.getBestSellingProduct));
router.get('/api/revenue', authAdmin, asyncHandler(controllerUser.getrevenue));

router.get('/api/users', authAdmin, asyncHandler(controllerUser.getAllUser));
router.get('/api/total-website', authAdmin, asyncHandler(controllerUser.totalWebsite));
router.post('/api/forgot-password', asyncHandler(controllerUser.forgotPassword));
router.post('/api/reset-password', asyncHandler(controllerUser.resetPassword));

router.get('/api/admin', authAdmin, (req, res) => {
    return res.status(200).json({ message: true });
});

module.exports = router;
