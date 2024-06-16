const orderModel = require('../models/orderModel');

// ----------------------------------------------------- READ --------------------------------------------------------------------------------

// Controller function to handle fetching all orders
async function getOrders(req, res) {
    try {
        const orders = await orderModel.readOrders(); 

        // If no orders are found, return an empty array
        if (!orders.length) {
            return []; 
        }
        return orders; 
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}


// ----------------------------------------------------- CREATE --------------------------------------------------------------------------------

// Controller function to handle adding a new order
async function addOrder(req, res) {
    try {
        const newOrder = req.body; // Get the order data from the request body

        // Validate the new order object (basic validation)
        if (!newOrder.userId || !newOrder.items) {
            return res.status(400).send('Invalid order data.');
        }

        // Add the new order using the model
        await orderModel.addOrder(newOrder);

        res.status(201).json({
            heading: 'Success!',
            summary: 'Your order was placed successfully!',
            icon: 'fa-check'
        })

    } catch (error) {
        console.error('Error adding order:', error);
        res.status(500).json({
            heading: 'Error!',
            summary: 'An unexpected error occurred when placing your order, please try again later.',
            icon: 'fa-triangle-exclamation'
        })
    }
}

// ----------------------------------------------------- DELETE --------------------------------------------------------------------------------

// Controller function to handle deleting an order
async function deleteOrder(req, res) {
    try {
    
        const orderNo = req.params.id; // Get the orderId from the request parameters
        console.log(orderNo+'ORDER NO');

        // Validate the orderId (basic validation)
        if (!orderNo) {
            return res.status(400).json({
                heading: 'Error!',
                summary: 'Incorrect Order Reference, please select a valid order!',
                icon: 'fa-triangle-exclamation'
            })
        }

        // Delete the order using the model
        await orderModel.deleteOrder(orderNo);
        res.status(200).json({
            heading: 'Success!',
            summary: 'Your order was successfully cancelled!',
            icon: 'fa-check'
        })

    } catch (error) {
        console.error('Error deleting order:', error);
            res.status(500).json({
                heading: 'Error!',
                summary: 'Incorrect Order Reference, please select a valid order!',
                icon: 'fa-triangle-exclamation'
            })

    }
}

module.exports = {
    getOrders,
    addOrder,
    deleteOrder
};