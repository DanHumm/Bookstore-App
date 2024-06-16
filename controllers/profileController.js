
const { getOrders } = require('../controllers/ordersController');
// const { getUserData} = require('../controllers/userController');

exports.getData = async (req, res, next) => {
    if(req.isAuthenticated){
        const orderData = await getOrders();
        res.render('profile', {
            title: 'Your Profile',
            orders: orderData,
            isAuthenticated: req.isAuthenticated,
            // user: userData
        });
    } else {
        res.redirect('/login');
    }
    // const userData = await getUserData();

}

