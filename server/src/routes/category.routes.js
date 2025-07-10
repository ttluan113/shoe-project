const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerCategory = require('../controllers/category.controller');

router.post('/api/add-category', asyncHandler(controllerCategory.addCategory));
router.get('/api/get-category', asyncHandler(controllerCategory.getCategory));
router.post('/api/update-category', asyncHandler(controllerCategory.updateCategory));
router.post('/api/delete-category', asyncHandler(controllerCategory.deleteCategory));

module.exports = router;
