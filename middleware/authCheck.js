// Auth check middleware [DH]
const bcrypt = require('bcrypt');
const { fetchToken } = require('./db');

const app = express();

// 30 Min session timeout
const timeout = 30 * 60 * 3000;

const sessionHandler = async (req, res, next) => {
    // Check for session token
    const sessionToken = req.cookies.sessionToken;

    if(sessionToken) {
        const sessionData

    }
}

const checkSession = async (req, res, next) => {
   try{
    if(req.session?.token && req.session?.user){ // Check these have values and are truthy values. Takes into consideration site visitors who may not have these set
        
        // Fetch stored token for authed user        
        const storedToken = await fetchToken(req.session.user);
        
        // Compare tokens using bcrypt.compare - Adds additional security making timing attacks ineffective by taking the same amount of time regardless of differing characters.
        const isValidToken = bcrypt.compare(req.session.token, storedToken);

        if(isValidToken){ // Check session token matches stored backend token
            next();
        } else {
            res.redirect('/login');
        }
    }
   } catch (error) {
    console.error('An error occured whilst checking authentication:', error);
    res.status(403).send('Internal Server Error');
   }
};


module.exports = { checkSession };