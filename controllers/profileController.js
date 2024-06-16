
const { getOrders } = require('../controllers/ordersController');
// const { getUserData} = require('../controllers/userController');

exports.getData = async (req, res, next) => {
    const orderData = await getOrders();
    // const userData = await getUserData();
    res.render('profile', {
        title: 'Your Profile',
        orders: orderData,
        isAuthenticated: req.isAuthenticated,
        // user: userData
    })
}

