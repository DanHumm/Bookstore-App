const express = require('express');
const router = express.Router();
//const UserController = require('./controllers/userController.js');

router.get('/', (req, res) => {
    res.render('index');

});

router.get('/store', (req, res) => {
    res.render('bookstore');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/register', (req, res) => {
    res.render('register');
});

module.exports = router;