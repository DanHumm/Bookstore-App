const express = require('express');
const app = express();
const router = express.Router();
const auth = require('../middleware/authentication.js');
const validation = require('../middleware/validation.js');
const { checkCredentials, genToken, fetchUserID } = require('../middleware/db.js');
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

app.post('/login', (req, res) => {
    const {username, password} = req.body;
    res.send('Submitted successfully'); // TEMP
    if(validateEmail(username) && validatePassword(password)){ // If they pass the sanitization and validation checks then proceed
        try {
            if(checkCredentials(username, password) == 1){
                const userId = fetchUserID(username);
                const token = genToken(userId);  
                const sessExpiry = new Date(Date().getTime + (30 * 60 * 1000));
               
                res.cookie('st', sessionToken, {
                    domain: "127.0.0.1",
                    path: "/",
                    expires: newExpiry,
                    httpOnly: true,
                    secure: true,
                    sameSite: strict
                });
                res.cookie('st', sessionToken, {
                    domain: "127.0.0.1",
                    path: "/",
                    expires: Date(Date().getTime + (3 * 24 * 60 * 60 * 1000)),
                    httpOnly: true,
                    secure: true,
                    sameSite: strict
                });
                console.log('Success, authenticated and session created');
                res.redirect('/store');
            }else{
                res.render('login', { error: 'Incorrect username or password' });
            }
        } catch (error) {
            console.log(error); // Logging throughout app is currently only during development. If pushed to production, there would be no verbose error messages to prevent attackers enumerating backend

        }
        
    } else {
        res.render('login', { error: 'Invalid username or password input, please try again' });

    }
});

module.exports = router, app;