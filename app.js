const express = require('express');
const session = require('express-session'); // Use for handling user sessions
const mysql = require('mysql12'); // For interactions with MySQL server
const bcrypt = require('bcrypt'); // For safe hashing of credentials
const authRoutes = require('./routes/authRoutes'); // For differentiating routes authed and unauthed users should get
const storeRoutes = require('./routes/bookstoreRoutes'); // For getting bookstore route related stuff

const app = express();
const PORT = process.env.PORT || 4040;

// Express session middleware for handling session related functions
app.use(session({
    secret: 'gjrnfdienkasdo1nrfigj4ndfi2jdfi59202werfds9233j', //Secret Key
    resave: false,
    saveUnitialized: true,
}));

// Statically serving files from the public dir
app.use(express.static('public'));

app.use('/bookstore', authRoutes.isAuthed, storeRoutes);

app.listen(PORT, () => {
    console.log('Server running on port: ${PORT}');
});