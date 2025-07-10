const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerCart = require('../controllers/cart.controller');

router.post('/api/add-cart', authUser, asyncHandler(controllerCart.addCart));
router.get('/api/get-cart', authUser, asyncHandler(controllerCart.getCart));
router.delete('/api/delete-cart', authUser, asyncHandler(controllerCart.deleteProductCart));
router.post('/api/update-cart', authUser, asyncHandler(controllerCart.updateCart));
router.post('/api/apply-coupon', authUser, asyncHandler(controllerCart.applyCoupon));
router.post('/api/update-quantity', authUser, asyncHandler(controllerCart.updateQuantity));

module.exports = router;
