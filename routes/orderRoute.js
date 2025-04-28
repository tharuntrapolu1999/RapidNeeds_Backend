import express from 'express';
import {
    placeOrder,
    verifyOrder,
    userOrders,
    listOrders,
    updateStatus,
    createPaypalOrder,
    capturePaypalOrder
} from '../controllers/orderController.js';

const router = express.Router();

// Route to place an order without payment
router.post('/place-order', placeOrder);

// Route to verify the payment status (simulated for now)
router.post('/verify-order', verifyOrder);

// Route to fetch orders for a user
router.post('/user-orders', userOrders);

// Route to list all orders (for admin)
router.get('/list-orders', listOrders);

// Route to update order status
router.post('/update-status', updateStatus);

// Route to create a PayPal order
router.post('/create-paypal-order', createPaypalOrder);

// Route to capture PayPal payment and save the order
router.post('/capture-paypal-order', capturePaypalOrder);

export default router;
