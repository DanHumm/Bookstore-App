// DB Middleware -DH
// Decided to use Single connections due to app size and simplicity,
// However for larger apps, more complex apps or apps with a large user base this should be converted to use Connection pooling for connection reuse and to reduce overhead.
// Example could be const pool = mysql.CreatePool(/* Pool config /*) then use pool.getConnection and connection.release instead.
const crypto = require('crypto');
const mysql = require('mysql12/promise');
const bcrypt = require('bcrypt');

const secretkey = "9kiFzQSDZBwWJ9kiFzQSDZBwWJTkIOR0Tv5J2P8eJZUD0TkIOR0Tv5J2P8eJZUD0";

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

// Fetching session token and expiry from db
const fetchTokenInfo = async (userID) => {
    try{

        connection = createConnection();

       // Use paramaterized query to grab stored token for supplied user id
        const [rows, fields] = await connection.execute('SELECT token, expiry FROM sessions WHERE uid = ?', [userID]);
        
        // Close connection once done 
        await connection.end();

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

// Fetching session tokens from db
const fetchTokenSig = async (userID) => {
    try{

        connection = createConnection();

       // Use paramaterized query to grab stored token for supplied user id
        const signature = await connection.execute('SELECT signature FROM sessions WHERE uid = ?', [userID]);
        
        // Close connection once done 
        await connection.end();

        return signature;

    } catch (error) {
        console.error('Error fetching token signature', error);
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
            
            await connection.execute('INSERT INTO users username, password, created_at, salt VALUES ?, ?, ?, ?', username, hPassSalt[0], currentTime, hPassSalt[1]);

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

const genToken = async (userID) => {
    try{
        if(userID){
            // Generate timestamp for session checks.
            const currentTime = new Date();
            const formattedCurrentTime = currentTime.toISOString().slice(0, 19).replace('T', ' ');
            const expiryTime = new Date(currentTime.getTime() + 30 * 60000).toISOString().slice(0, 19).replace('T', ' ');
            // Generate random 32 byte token aka 64 char length.
            const token = crypto.randomBytes(32).toString('hex');
            // generate hmac used for integrity and authentication checks.
            const hmac = crypto.createHmac('sha256', secretkey); // Not declared as global value as it shouldnt be used concurrently. Using this globally can lead to race conditions causing the value to be unpredictable with heavier traffic.
            // Generate token signature
            const signature = hmac.update(token).digest('hex');
            if(signature){
                connection = connection.createConnection();
                await connection.execute('INSERT INTO sessions uid, token, signature, created_at, expiry VALUES ?, ?, ?, ?, ?', userID, token, signature, currentTime, expiryTime);
                await connection.end();
                console.log('Successfully generated & Stored token');
                return token;
            } else {
                throw new Error('Error generating signature');
            }
        } else {
            throw new Error('Invalid or falsy userID');
        }

    } catch (error){
        console.error('Error generating token: ', error);
        throw error;
    }
};

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
// TO DO:
// Need to adjust db sessions table slightly to adjust for new gen token function.
// Need to check some of these queries to clear up confusion about db structure ie. Is it uid or id for user id? Check! Adjust.
// Check the check credentials function over. Have i not implemented the hashing of passed pw via requests for checking or??