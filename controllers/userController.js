const bcrypt = require('bcrypt'); // For password hashing
const userModel = require('../models/userModel');
const { validatePassword } = require('../middleware/validation');
const dbm = require('../middleware/db');

// ----------------------------------------------------- READ --------------------------------------------------------------------------------

async function getUserData(req, res) {
    try {
        // User Id
        const userId = req.cookies?.['uid']

        // Fetch User from Model Function using currently authenticated user's ID.
        const userData = await userModel.getUserById(userId);

        // If the user doesn't exist in the database, return 404 status code and send custom message
        if (!userData) {
            return res.status(404).send('User not found.');
        }

        // Render the profile view with attatched userData
        res.render('profile', { user: userData });
    } catch (error) {
        console.error('Error getting user data:', error);
        res.status(500).send('An error occurred while fetching user data.');
    }
}


async function renderChangePasswordForm(req, res) {
    res.render('password', {isAuthenticated: req.isAuthenticated}); // Render the EJS template
}

// ----------------------------------------------------- UPDATE --------------------------------------------------------------------------------

async function changePassword(req, res) {
    try {
        if(req.isAuthenticated){
            const { currentPassword, newPassword, confirmPassword } = req.body;

            // Validate fields are filled
            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.status(400).send('All fields are required.');
            }
    
            if (newPassword !== confirmPassword) {
                return res.status(400).send('New passwords do not match.');
            }
    
    
            if(!validatePassword(newPassword)) {
                return res.status(403).send('Password is not strong enough');
            }
            if(!req.cookies.st){
                return res.status(403).send('You are not authenticated');
            }
            // Fetch the current user data from the database
            const value = await dbm.updatePass(currentPassword, newPassword, req.cookies.st);
            if(value == 0){
                return res.status(404).send('User not found.');
            } else if (value == 1){
               return res.status(400).send('Current password is incorrect.');

            } else{
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
                    window.location.href = "/profile"; 
                  }, 2000);
                </script>
              `);
            }

        } else{
            res.redirect('/login');
        }
       
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).send('An error occurred while changing the password.');
    }
}

const logEvent = (userId, event) => {
    console.log(`User ID: ${userId} - ${event} - ${new Date().toISOString()}`);
};


module.exports = {
    renderChangePasswordForm,
    changePassword,
    getUserData
};