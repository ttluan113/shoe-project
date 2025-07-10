const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerProduct = require('../controllers/products.controller');

router.post('/api/add-product', asyncHandler(controllerProduct.addProduct));
router.get('/api/get-all-product', asyncHandler(controllerProduct.getAllProduct));
router.get('/api/get-product-by-id', asyncHandler(controllerProduct.getProductById));
router.get('/api/get-product-by-category', asyncHandler(controllerProduct.getProductByCategory));
router.get('/api/search-product', asyncHandler(controllerProduct.SearchProduct));
router.get('/api/get-all-product-admin', authAdmin, asyncHandler(controllerProduct.getAllProductAdmin));
router.post('/api/delete-product', authAdmin, asyncHandler(controllerProduct.deleteProduct));
router.post('/api/update-product', authAdmin, asyncHandler(controllerProduct.updateProduct));

module.exports = router;
