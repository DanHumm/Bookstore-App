const fs = require('fs').promises;
const path = require('path');
const p = path.join(path.dirname(require.main.filename),
'data',
'orders.json');


// Function to read orders from the JSON file
async function readOrders() {
    try {
        const data = await fs.readFile(p, 'utf-8');
        if(!data || !data.length > 0) {
            return []
        }
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // If the file does not exist, return an empty array
            return [];
        } else {
            console.error('Error reading orders:', error);
            throw error;
        }
    }
}

// Function to write orders to the JSON file
async function writeOrders(orders) {
    try {
        const data = JSON.stringify(orders, null, 2);
        await fs.writeFile(p, data, 'utf-8');
    } catch (error) {
        console.error('Error writing orders:', error);
        throw error;
    }
}

// Function to add a new order
async function addOrder(newOrder) {
    const orders = await readOrders(); 
    orders.unshift(newOrder); 
    await writeOrders(orders); 
}

async function deleteOrder(orderNo) {
    const orders = await readOrders();
    const updatedOrders = orders.filter(order => order.orderNo !== orderNo); 

    if (orders.length === updatedOrders.length) {
        throw new Error('Order not found'); 
    }

    await writeOrders(updatedOrders); 
}


module.exports = {
    readOrders,
    addOrder,
    deleteOrder
}