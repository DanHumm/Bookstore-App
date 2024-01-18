// Auth check middleware [DH]
const { fetchTokenInfo, fetchSalt, extendExpiry } = require('./db');

const app = express();
app.use(cookieParser());
const authenticatedRoutes = [
    '/basket',
    '/order-history'
];
const blockAuthedRoutes = [
    '/login',
    '/register'
];

// 30 Min session timeout
const timeout = 30 * 60 * 3000;

const sessionHandler = async (req, res, next) => {
    // Check for session token
    const sessionToken = req.cookies?.['st'];
    const userId = req.cookies?.['uid'];
    // Check user has a session cookie first
    if(sessionToken && userId){
        // Check is session token is valid and not expired
        if(checkSession(userId, sessionToken)){
            if(blockAuthedRoutes.includes(req.path)){ // If authed user is trying to navigate to registration or login when authed, redirect.
                extendExpiry(userId, timeout);
                res.cookie('st', sessionToken, {
                    expires: newExpiry,
                    httpOnly: true,
                    secure: true
                });
                res.redirect('/');
            } else{
                extendExpiry(userId, timeout)
                res.cookie('st', sessionToken, {
                    expires: newExpiry,
                    httpOnly: true,
                    secure: true
                });
                next();
            }            
        }
        else{
            // Do Logic for clearing Cookies
            res.redirect('/login');
        }
    }
    else if (sessionToken == undefined && userId == undefined){ // If these are undefined, then the cookies have not been set. Assume unauthed visitor.
        if(authenticatedRoutes.includes(req.path)){
            res.redirect('/login');
        } else {
            next();
        }
    }
    else{
        // Do Logic for clearing cookies
        res.redirect('/login');
    }
    
};


const checkSession = async (userId, usersToken) => {
   try{
    if(usersToken && userId){ // Check these have values and are truthy values. Takes into consideration site visitors who may not have these set
        
        // Fetch stored token for authed user        
        const tokenInfo = await fetchTokenInfo(userId);
        const salt = await fetchSalt(userId)
        const currentTimestamp = Math.floor(Date.now() / 1000);
        // Compare tokens using bcrypt.compare - Adds additional security making timing attacks ineffective by taking the same amount of time regardless of differing characters.
        const isValidToken = bcrypt.compare(bcrypt.hash(usersToken, salt), tokenInfo[0]);

        if(isValidToken && tokenInfo[1] > currentTimestamp){ // Check session token matches stored backend token
            return true;
        } else {
            return false;
        }
    }
   } catch (error) {
    console.error('An error occurred whilst checking authentication:', error);
    return false;
   }
};


module.exports = { checkSession };