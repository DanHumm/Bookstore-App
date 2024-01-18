// DB Middleware -DH
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


// --------------------------------------- FETCHING FROM DB --------------------------------------------------------------------------------------------------------------------------------------

// Fetching session tokens from db
const fetchToken = async (userID) => {
    try{

        connection = createConnection();

       // Use paramaterized query to grab stored token for supplied user id
        const [rows, fields] = await connection.execute('SELECT hashed_token FROM users WHERE id = ?', [userID]);
        
        // Close connection once done 
        await connection.end();

        // Get the hashed token from result set, or set it to null if no value was returned.
        const token = rows.length > 0 ? rows[0].hashed_token : null;
        
        return token;

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
    fetchToken,
     fetchSalt
};