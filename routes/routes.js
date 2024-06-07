const express = require('express');
const app = express();
const router = express.Router();
const auth = require('../middleware/authentication.js');
const bodyParser = require('body-parser');
const validation = require('../middleware/validation.js');
const { checkCredentials, genToken, fetchUserID, storeUserCreds } = require('../middleware/db.js');
//const UserController = require('./controllers/userController.js');
const storeController = require('../controllers/storeController.js');


/////////////////// INVESTIGATE SESSION EXPIRY ISSUE - 30 MINS AFTER LAST ACCESSED TIME INSTEAD OF 30 MINS AFTER NOW TIME

router.post('/login', async (req, res) => {
   if(!req.user){
    const {username, password} = req.body;
    //res.send('Submitted successfully'); // TEMP
    if(validation.validateUsername(username) && validation.validatePassword(password)){ // If they pass the sanitization and validation checks then proceed
        try {
            const result = await checkCredentials(username, password);
            console.log("Inside /login, the result returned by checkCred is: "+result);
            if(result === 1){
                console.log("Can confirm,, record was found");
                const userId = await fetchUserID(username);
                console.log("The user id from fetch user id is: "+userId);
                const token = await genToken(userId);             
                const expiry = new Date(new Date().getTime() + 30 * 60 * 1000)
                console.log('-1-1-1-1-1-'+expiry);

                res.cookie('st', token, {
                    domain: "localhost",
                    path: "/",
                    expires: new Date(new Date().getTime() + 30 * 60 * 1000),
                    httpOnly: true,
                 //Would implement in a HTTPS with strict transport security   secure: true,
                    sameSite: "strict"
                });
                res.cookie('st', token, {
                    domain: "localhost",
                    path: "/",
                    expires: new Date(new Date().getTime() + 30 * 60 * 1000),
                    httpOnly: true,
                //Would implement in a HTTPS with strict transport security    secure: true, 
                    sameSite: "strict"
                });
                console.log('Success, authenticated and session created');
                req.user = {id: userId, username: username};
                res.redirect('/store');
            }else{
                res.render('login', { error: 'Incorrect username or password' });
            }
        } catch (error) {
            console.log(error); // Logging throughout app is currently only during development. If pushed to production, there would be no verbose error messages to prevent attackers enumerating backend

        }
        
    } else {
        return res.status(401).json({ error: 'Invalid username or password'});
        console.log("Failed-Login");
    }
} else {
    res.redirect("/store");
}
});

router.post('/register', async (req, res) => {
    if(!req.user){
    const {username, email, password} = req.body;
    console.log(req.body);
    if(!validation.validateEmail(email)){
        res.send("The email did not pass validation");
    } else if (!validation.validateUsername(username)){
        res.send("The username did not pass validation");
    } else if (!validation.validatePassword(password)){
        res.send("The password did not pass validation");
    }   
    else{

        try {
            const result = await storeUserCreds(username, email, password);
            if(result === 1){
                res.send(`
                <style>
                  .success-message {
                    background-color: #4CAF50; /* Green background */
                    color: white;
                    padding: 15px;
                    text-align: center;
                    border-radius: 5px; /* Rounded corners */
                  }
                </style>
                <div class="success-message">Success!</div>
                <script>
                setTimeout(function() {
                    window.location.href = "/login"; 
                  }, 2000);
                </script>
              `);
            } else{
                res.render('register', { error: 'Sorry, an error occurred. Try again later.' });
            }
        } catch (error) {
            console.log(error); // Logging throughout app is currently only during development. If pushed to production, there would be no verbose error messages to prevent attackers enumerating backend

        }
        
    }
} else {
    res.redirect("/store");
}
});
router.get('/store',  storeController.getBooks);

router.get('/cart',  (req, res) => {
    res.render('cart');
});
router.get('/', (req, res) => {
    res.render('index');

});

router.get('/api/books',  storeController.getBooksJson);

router.get('/store', (req, res) => {
    console.log(req.cookie);
    res.render('bookstore');
});

router.post('/orders', bodyParser.json(), storeController.addOrder);

router.get('/profile', (req, res) => {
    res.render('profile');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/checkout', (req,res) => {
    if(req.user){
        res.render('cart');
    } else {
        res.redirect('/login');
    }
});

router.get('/register', (req, res) => {
    res.render('register');
});
module.exports = router;