// DB Middleware -DH
// Decided to use Single connections due to app size and simplicity,
// However for larger apps, more complex apps or apps with a large user base this should be converted to use Connection pooling for connection reuse and to reduce overhead.
// Example could be const pool = mysql.CreatePool(/* Pool config /*) then use pool.getConnection and connection.release instead.
const mysql = require('mysql12/promise');
const bcrypt = require('bcrypt');
//DB configuration
const dbConfig = {
    // INSERT DB CONFIG
};

// Establishing db connections
const createConnection = async () => {
    try{
        const connection = await mysql.createConnection(dbConfig);
        return connection;
    } catch (error) {
        console.error('Error connecting to db', error);
        throw error;
    }
}


// --------------------------------------- SELECTING FROM DB --------------------------------------------------------------------------------------------------------------------------------------

// Fetching session tokens from db
const fetchTokenInfo = async (userID) => {
    try{

        connection = createConnection();

       // Use paramaterized query to grab stored token for supplied user id
        const [rows, fields] = await connection.execute('SELECT token, expiry FROM sessions WHERE id = ?', [userID]);
        
        // Close connection once done 
        await connection.end();

        // Get the hashed token and expiry time from result set, or set it to null if no value was returned.
       // const token = rows.length > 0 ? rows[0].token : null;
       // const expiry = rows.length > 0 ? rows[1].expiry : null;
        const tokenInfo = [rows.length > 0 ? rows[0].token : null, rows.length > 0 ? rows[1].expiry : null];
        return tokenInfo;

    } catch (error) {
        console.error('Error fetching token', error);
        throw error;
    }

};

const fetchSalt = async (userID) => {
    try{
        // Create db connection
        connection = createConnection();
        
        // Get salt from db
        const [rows, fields] = await connection.execute('SELECT salt FROM users WHERE id = ?', [userID]);

        // Close db connection
        await connection.end();

        // Set salt to row value, or if result set is empty, set variable to null.
        const salt = rows.length > 0 ? rows[0].salt : null;

        return salt;

    } catch (error) {
       
        console.error('Error fetching salt:', error);
       
        throw error;
    }

};
// ----------------------------------------------------- UPDATE --------------------------------------------------------------------------------

const extendExpiry = async (userID, token, timeout) => {
    try{
        // Create db connection
        connection = createConnection();
        
        const newExpiry = new Date(Date().getTime + timeout);
        await connection.execute('UPDATE sessions SET expiry = ? WHERE uid = ? AND token = ?', newExpiry.toISOString().slice(0,19).replace('T', ' '), userID, token); // Set new expiry, converts JS date object to string format expected by MySQL TIMESTAMP type. 
        // Close db connection
        await connection.end();
        return newExpiry;
    } catch (error) {
       
        console.error('Error setting new expiry:', error);
       
        throw error;
    }

};

// ----------------------------------------------- DELETING ---------------------------------------------------

const expireSession = async (token) => {
    try{
        connection = createConnection();
        await connection.execute('DELETE FROM sessions WHERE token = ?', token) // Delete user sessions relating to token
    }
    catch (error) {
        console.error('Error expiring session:', error);
        throw error;
    }
};

// ------------------------------------------------------ CHECKS ---------------------------------------------------------
const checkCredentials = async (username, password) => {
    try{
        // Create db connection
        connection = createConnection();
        
        // Get salt from db
        const [rows, fields] = await connection.execute('SELECT id, password FROM users WHERE username = ? AND password = ?', [userID]);

        // Close db connection
        await connection.end();

        // Set salt to row value, or if result set is empty, set variable to null.
        const salt = rows.length > 0 ? rows[0].salt : null;

        return salt;

    } catch (error) {
       
        console.error('Error fetching salt:', error);
       
        throw error;
    }

};
module.exports = {
    createConnection, 
    fetchTokenInfo,
     fetchSalt,
     checkCredentials,
     extendExpiry,
     expireSession 
};