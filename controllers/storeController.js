const Catalog = require('../models/catalog.js');
const Orders = require('../models/orders.js');
const cookieParser = require('cookie-parser');
const auth = require('../middleware/authentication.js');

exports.getBooks =  async (req, res, next) => {
   console.log(req.cookies);
   
    await auth.authMiddleware(req, res, () => {
        Catalog.getBooks((books) => {
            res.render('bookstore', {
                title: 'Store',
                books: books,
                isAuthenticated: req.isAuthenticated,
           });
        });
    });
}

exports.getBooksJson =  (req, res, next) => {
    Catalog.getBooks((books) => {
        res.json(books);
    });
}

exports.addOrder = (req, res) => {
    let code;
    let heading;
    let summary;
    let icon;

    Orders.addOrder(req.body, (completed) => {
        if(completed) {
            code = 200;
            heading = "Success!";
            summary = "Your order was placed successfully!";
            icon = "fa-check";
        } else {
            code = 500;
            heading = "Error!";
            summary = "An unexpected error occurred when placing your order, please try again later.";
            icon = "fa-triangle-exclamation";
        }
        res.status(code).json({
            completed: completed,
            heading: heading,
            summary: summary,
            icon: icon
        }).end();
    });
}



