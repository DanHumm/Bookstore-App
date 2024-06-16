const { createConnection } = require('../middleware/db');

exports.getUserById = async (userId) => {
    const connection = await createConnection();
    try {
        const [user] = await connection.execute('SELECT username, email, date_of_birth FROM users WHERE id = ?', [userId]);
        return user;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
}