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

const fetchSalt = async (userID, username = null) => {
    try{
        // Create db connection
        connection = createConnection();
        
        // Checks if either userid or username has truthy values
        if(userID || username){
            const [rows, fields] = await connection.execute('SELECT salt FROM users WHERE id = ? OR username = ?', userID, username);
        } else{
            throw new Error('A username or user id is required.');
        }
        // Get salt from db

        // Close db connection
        await connection.end();

        // Check if a salt value was retreived or not
        if(rows.length === 0){
            return 'a'; // Return random invalid salt value to prevent username enumeration via response timing attacks. This way, it still performs a credential check like it would with valid credentials but will always fail.
        }
        else{
            const salt = rows[0].salt;
            return salt;
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
const checkCredentials = async (reqUsername, reqPassword) => {
    try{
        // Create db connection
        connection = createConnection();
        
        
        if(reqUsername){
            const salt = fetchSalt(reqUsername);

        const result = await connection.execute('SELECT COUNT(*) AS count FROM users WHERE username = ? AND password = ?', reqUsername, reqPassword);

        // Close db connection
        await connection.end();

        // Store count variable. If 1, then there is a match. Otherwise no records match supplied inputs.
        const count = result[0].count;
        

        return count;
        } else{
            throw new Error('Username was not a valid value type. Expected String');
        }

    } catch (error) {
       
        console.error('Error checking credentials:', error);
       
        throw error;
    }

};

// ------------------------------------------------------------ INSERT ------------------------------------------------------

const storeUserCreds = async (username, pass) =>{
    const hPassSalt = hashPass(pass);
    
    try{
        if(hPassSalt.every(item => item)){ // Checks every value in my array for truthy values.
            connection = createConnection();
            
            // Gets current timestamp in the mysql format
            const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
            
            await connection.execute(' INSERT INTO users username, password, created_at, salt VALUES ?, ?, ?, ?', username, hPassSalt[0], currentTime, hPassSalt[1]);

            await connection.end();

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

const hashPass = async (pass) => {
    const salt = await bcrypt.genSalt(10); // 10 is currently considered a good balance between performance and safety
    bcrypt.hash(pass, salt, (err, hash) => {
        if(err){
            return false;
        } else{
            return [hash, salt];
        }
    })
};
module.exports = {
    createConnection, 
    fetchTokenInfo,
     fetchSalt,
     checkCredentials,
     extendExpiry,
     expireSession,
     storeUserCreds
};