const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerPayments = require('../controllers/payments.controller');

router.post('/api/create-payments', authUser, asyncHandler(controllerPayments.createPayments));
router.get('/api/checkdata-vnpay', asyncHandler(controllerPayments.checkDataVNPay));
router.get('/api/checkdata-momo', asyncHandler(controllerPayments.checkDataMomo));
router.get('/api/get-payment', asyncHandler(controllerPayments.getPayment));
router.get('/api/get-payments-user', authUser, asyncHandler(controllerPayments.getPaymentsUser));
router.put('/api/cancel-payment/:id', authUser, asyncHandler(controllerPayments.cancelPayment));
router.get('/api/payments-admin', authAdmin, asyncHandler(controllerPayments.getPaymentAdmin));
router.get('/api/payments-admin2', authAdmin, asyncHandler(controllerPayments.getPaymentAdmin2));
router.put('/api/update-payment', authAdmin, asyncHandler(controllerPayments.updatePayment));
router.post('/api/cancel-order', authUser, asyncHandler(controllerPayments.cancelOrder));

module.exports = router;
