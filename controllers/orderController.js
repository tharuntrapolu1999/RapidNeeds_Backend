import orderModel from "../models/orderModel.js";
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";

// PayPal client setup
const Environment = process.env.NODE_ENV === "development"
    ? checkoutNodeJssdk.core.SandboxEnvironment
    : checkoutNodeJssdk.core.LiveEnvironment;
    
const paypalClient = () => {
    return new checkoutNodeJssdk.core.PayPalHttpClient(
        new Environment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    );
};

// Place an order (no payment)
const placeOrder = async (req, res) => {
    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            payment: false,
            status: "Pending"
        });
        await newOrder.save();
        res.json({ success: true, message: "Order placed successfully", orderId: newOrder._id });
    } catch (error) {
        console.error("Error in placeOrder:", error);
        res.json({ success: false, message: "Error placing order" });
    }
};

// Verify order status manually (simulate payment success/failure)
const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Order verified" });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Order cancelled" });
        }
    } catch (error) {
        console.error("Error in verifyOrder:", error);
        res.json({ success: false, message: "Error verifying order" });
    }
};

// Fetch user orders
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("Error in userOrders:", error);
        res.json({ success: false, message: "Error fetching orders" });
    }
};

// Fetch all orders (for admin)
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("Error in listOrders:", error);
        res.json({ success: false, message: "Error fetching orders" });
    }
};

// Update order status
const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Order status updated" });
    } catch (error) {
        console.error("Error in updateStatus:", error);
        res.json({ success: false, message: "Error updating status" });
    }
};

// Create a PayPal order
const createPaypalOrder = async (req, res) => {
    const { amount } = req.body;  // Ensure this is coming from frontend

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: "CAPTURE",
        purchase_units: [{
            amount: {
                currency_code: "USD",
                value: amount.toString(),
            }
        }]
    });

    try {
        const client = paypalClient();
        const order = await client.execute(request);  // Executes the PayPal order
        res.json({ success: true, id: order.result.id });  // Return the order ID
    } catch (err) {
        console.error("Error in createPaypalOrder:", err);
        res.json({ success: false, message: "PayPal order creation failed" });
    }
};

/// Capture PayPal payment and place the order
const capturePaypalOrder = async (req, res) => {
    const { orderId, userId, items, amount, address } = req.body;

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
        const client = paypalClient();
        const capture = await client.execute(request);

        if (capture.result.status === "COMPLETED") {
            const newOrder = new orderModel({
                userId,
                items,
                amount,
                address,
                payment: true,
                status: "Pending"
            });
            await newOrder.save();
            res.json({ success: true, message: "Payment captured & order placed", orderId: newOrder._id });
        } else {
            res.json({ success: false, message: "Payment not completed" });
        }
    } catch (err) {
        console.error("Error in capturePaypalOrder:", err);
        res.json({ success: false, message: "Payment capture failed" });
    }
};

console.log("PayPal Client ID:", process.env.PAYPAL_CLIENT_ID);
console.log("PayPal Client Secret:", process.env.PAYPAL_CLIENT_SECRET);

export {
    placeOrder,
    verifyOrder,
    userOrders,
    listOrders,
    updateStatus,
    createPaypalOrder,
    capturePaypalOrder
};
