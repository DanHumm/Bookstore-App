const express = require('express');
const mysql = require('mysql12'); // For interactions with MySQL server
const bcrypt = require('bcrypt'); // For safe hashing of credentials
const authRoutes = require('./routes/authRoutes'); // For differentiating routes authed and unauthed users should get
const storeRoutes = require('./routes/bookstoreRoutes'); // For getting bookstore route related stuff
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 4040;

// Future improvement could be made. In the future, i would consider using promises opposed to callback functions for easier cleaner code and better integrations with async/await

// Statically serving files from the public dir
app.use(express.static('public'));

app.use('/bookstore', authRoutes.isAuthed, storeRoutes);

app.listen(PORT, () => {
    console.log('Server running on port: ${PORT}');
});