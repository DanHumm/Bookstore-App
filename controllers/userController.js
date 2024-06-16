const bcrypt = require('bcrypt'); // For password hashing
const userModel = require('../models/userModel');
const { validatePassword } = require('../middleware/validation');
const dbMiddleware = require('../middleware/db');

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
    if(req.isAuthenticated){
        res.render('password', {isAuthenticated: req.isAuthenticated}); // Render the EJS template
    }
    else {
        res.redirect('/login');
    }
}

// ----------------------------------------------------- UPDATE --------------------------------------------------------------------------------

async function changePassword(req, res) {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validate fields are filled
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).send('All fields are required.');
        }

        // Check if new passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).send('New passwords do not match.');
        }


        if(!validatePassword(newPassword)) {
            return res.status(403).send('Password is not strong enough');
        }

        // Fetch the current user data from the database
        if(req.cookies.st){
            const userId = dbMiddleware.fetchUserID(null, req.cookies.st);
            const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
            if (user.length === 0) {
                return res.status(404).send('User not found.');
            }
             // Check if current password is correct
            const validPassword = await bcrypt.compare(currentPassword, user[0].password_hash);
            if (!validPassword) {
                return res.status(400).send('Current password is incorrect.');
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update the user's password in the database
            await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);

            logEvent(userId, 'Password change');
            res.send('Password changed successfully.');
        } else {
            return res.status(400).send('You are not authenticated, please login.');
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