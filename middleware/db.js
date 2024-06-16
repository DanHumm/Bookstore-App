// DB Middleware -DH
// Decided to use Single connections due to app size and simplicity,
// However for larger apps, more complex apps or apps with a large user base this should be converted to use Connection pooling for connection reuse and to reduce overhead.
// Example could be const pool = mysql.CreatePool(/* Pool config /*) then use pool.getConnection and connection.release instead.
require('dotenv').config();
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const secretkey = process.env.SECRET_KEY;

//DB configuration

const pool = mysql.createPool({
    namedPlaceholders: true,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    queueLimit: 0,
});

module.exports = pool;

// Establishing db connections

async function createConnection() {
    try {
        return await pool.getConnection();
    } catch (err) {
        console.error('Error getting db connection:', err);
        throw err;
    }
}

// --------------------------------------- SELECTING FROM DB --------------------------------------------------------------------------------------------------------------------------------------

// Fetching session token and expiry from db
const fetchTokenInfo = async (userID) => {
    try{

        const connection = await pool.getConnection();

       // Use paramaterized query to grab stored token for supplied user id
        const [rows, fields] = await connection.execute('SELECT token, expiry FROM sessions WHERE uid = ?', [userID]);
        
        // Close connection once done 
        await connection.release();

        // Get the hashed token and expiry time from result set, or set it to null if no value was returned.
       // const token = rows.length > 0 ? rows[0].token : null;
       // const expiry = rows.length > 0 ? rows[1].expiry : null;
        const tokenInfo = [rows.length > 0 ? rows[0].token : null, rows.length > 0 ? rows[1].expiry : null];
        return tokenInfo;

    } catch (error) {
        console.error('Error fetching token info', error);
        throw error;
    }

};

const checkToken = async (token) => {
    try{
        const connection = await pool.getConnection();

        const [rows] = await connection.execute('SELECT IF(EXISTS(SELECT 1 FROM sessions WHERE token = ?), 1, 0) AS tokenExists', [token]);
        connection.release();

        return rows[0].tokenExists === 1;
    } catch (error) {
        throw error;
    }
};

const fetchUserID = async (username, token = null) => {
    try{

        const connection = await pool.getConnection();
        if(token){
            const [rows, fields] = await connection.execute('SELECT user_id FROM sessions WHERE token = ?', [token]);
            await connection.release();

            if(rows.length > 0){
                return rows[0].user_id;
            } else {
                return null;
            }
        } else {
                   // Use paramaterized query to grab stored userID for supplied username
       const [rows, fields] = await connection.execute('SELECT id FROM users WHERE username = ?', [username]);
       // Close connection once done 
       await connection.release();

       if(rows.length > 0){ // If exists, return userid
           return rows[0].id;
       }else{
           return null; // user doesnt exist
       }
        }


    } catch (error) {
        console.error('Error fetching username info', error);
        throw error;
    }

};

// Fetching session tokens from db
const fetchTokenSig = async (userID) => {
    try{

        const connection = await pool.getConnection();

       // Use paramaterized query to grab stored token for supplied user id
        const signature = await connection.execute('SELECT signature FROM sessions WHERE uid = ?', [userID]);
        
        // Close connection once done 
        await connection.release();

        return signature;

    } catch (error) {
        console.error('Error fetching token signature', error);
        throw error;
    }

};

const fetchSalt = async (userID, username = null) => {
    try{
            console.log("Fetch salt username is: "+username);
        // Checks if either userid or username has truthy values
        if(userID || username){
            const connection = await pool.getConnection();
            if(username){
                const [rows, fields] = await connection.execute('SELECT salt FROM users WHERE username = (?)', [username]);
                if(rows.length === 0){
                    await connection.release();
                    return 'a'; // Return random invalid salt value to prevent username enumeration via response timing attacks. This way, it still performs a credential check like it would with valid credentials but will always fail.
                }
                else{
                    await connection.release();
                    const salt = rows[0].salt;
                    return salt;
                }
            } else {
                const [rows, fields] = await connection.execute('SELECT salt FROM users WHERE id = (?)', [userID]);
                if(rows.length === 0){
                    await connection.release();
                    return 'a'; // Return random invalid salt value to prevent username enumeration via response timing attacks. This way, it still performs a credential check like it would with valid credentials but will always fail.
                }
                else{
                    await connection.release();
                    const salt = rows[0].salt;
                    return salt;
                }
        }
        } else{
            throw new Error('A username or user id is required.');
        }

    } catch (error) {
       
        console.error('Error fetching salt:', error);
       
        throw error;
    }

};
// ----------------------------------------------------- UPDATE --------------------------------------------------------------------------------

const extendExpiry = async (userID, token, timeout) => {
    try{
        // Create db connection
        const connection = await pool.getConnection();
        
        const newExpiry = new Date(Date().getTime + timeout);
        await connection.execute('UPDATE sessions SET expiry = ? WHERE uid = ? AND token = ?', newExpiry.toISOString().slice(0,19).replace('T', ' '), userID, token); // Set new expiry, converts JS date object to string format expected by MySQL TIMESTAMP type. 
        // Close db connection
        await connection.release();
        return newExpiry;
    } catch (error) {
       
        console.error('Error setting new expiry:', error);
       
        throw error;
    }

};

// ----------------------------------------------- DELETING ---------------------------------------------------

const expireSession = async (token) => {
    try{
        const connection = await pool.getConnection();
        await connection.execute('DELETE FROM sessions WHERE token = ?', [token]) // Delete user sessions relating to token
        await connection.release();
        console.log("Completed token deletion");
    }
    catch (error) {
        console.error('Error expiring session:', error);
        throw error;
    }
};

// ------------------------------------------------------ CHECKS ---------------------------------------------------------
const checkCredentials = async (reqUsername, reqPassword) => {
    try{
        // Create db connection
       const connection = await pool.getConnection();
        
        
        if(reqUsername){
            const [rows, fields] = await connection.execute('SELECT password_hash FROM users WHERE username = ?', [reqUsername]);

            // Close db connection
            await connection.release();
            if(bcrypt.compare(reqPassword, rows[0].password_hash)){
                return 1;
            } else {
                return 0;
            }
        } else{
            throw new Error('Username was not a valid value type. Expected String');
        }

    } catch (error) {
       
        console.error('Error checking credentials:', error);
       
        throw error;
    }

};

// ------------------------------------------------------------ INSERT ------------------------------------------------------

const storeUserCreds = async (username, email,  pass) =>{

    const hPassSalt = await hashPass(pass); 
    try{
        console.log(hPassSalt[0] + '-----' +hPassSalt[1]);
        if(Array.isArray(hPassSalt) && hPassSalt.every(Boolean)){ // Checks every value in my array for truthy values.
            const connection = await pool.getConnection();
            
            // Gets current timestamp in the mysql format
            const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
            
            await connection.execute('INSERT INTO users (username, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)', [username, email, hPassSalt[0], hPassSalt[1], currentTime]);

            await connection.release();

            console.log('Success! User created');
            return true;
        } else{
            throw new Error('The hashed password or salt was of an invalid (falsy) value');
        }
    } catch (error) {
        console.error('Error storing credentials:', error);
        throw error;
    }
}

const genToken = async (userID = null) => {
    try{
        if(userID){
            // Generate timestamp for session checks.
            const currentTime = new Date();
            const expiryTime = (new Date(Date.now() + 30 * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' ');
            // Generate random 32 byte token aka 64 char length.
            const token = crypto.randomBytes(32).toString('hex');
            // generate hmac used for integrity and authentication checks.
            console.log('\n'+expiryTime+'\n'+token);
                const connection = await pool.getConnection();
                if(userID){
                    await connection.execute('INSERT INTO sessions (user_id, token, created_at, expires_at) VALUES (?, ?, ?, ?)', [userID, token, currentTime, expiryTime]);
                }
                else{
                    throw new Error('No truthy values supplied');
                }
                await connection.release();
                console.log('Successfully generated & Stored token');
                return token;
        } else {
            throw new Error('Invalid or falsy userID');
        }

    } catch (error){
        console.error('Error generating token: ', error);
        throw error;
    }
};

const hashPass = async (pass, Psalt = null) => {
   if(Psalt){
    const hash = await bcrypt.hash(pass, Psalt);
    return [hash, Psalt]; // Return an array
   } else {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pass, salt);
    return [hash, salt]; // Return an array
   }
   

    // Extract the salt from the hash string
  };

const updatePass = async (currpass, newpass, token) => {
            try {
                const connection = await pool.getConnection();
                const userId = await fetchUserID(null, token); // Assuming user is authenticated and user ID is stored in req.user
                
                const [rows, fields] = await connection.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
        
                if (rows[0].password_hash === 0) {
                    return 0;
                }
                console.log(rows[0]);
                // Check if current password is correct
                const validPassword = await bcrypt.compare(currpass, rows[0].password_hash);
                if (!validPassword) {
                    return 1;
                }
        
                // Hash the new password
                const hashedPassword = await bcrypt.hash(newpass, 10);
                await connection.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);
                connection.release();                
                console.log('SUCCESS-CHANGED');
                return 2;
            } 
            catch (error) {
             throw error;   
            }
            
};
module.exports = {
    createConnection, 
    fetchTokenInfo,
     fetchSalt,
     fetchUserID,
     genToken,
     checkCredentials,
     extendExpiry,
     expireSession,
     storeUserCreds,
     checkToken,
     updatePass
};
// TO DO:
// Need to adjust db sessions table slightly to adjust for new gen token function.
// Need to check some of these queries to clear up confusion about db structure ie. Is it uid or id for user id? Check! Adjust.
// Check the check credentials function over. Have i not implemented the hashing of passed pw via requests for checking or??