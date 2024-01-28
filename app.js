const express = require('express');
const mysql = require('mysql2'); // For interactions with MySQL server
const bcrypt = require('bcrypt'); // For safe hashing of credentials
//const authRoutes = require('./routes/authRoutes'); // For differentiating routes authed and unauthed users should get
//const storeRoutes = require('./routes/bookstoreRoutes'); // For getting bookstore route related stuff
const siteRoutes = require('./routes/routes'); // TEMPORARY - testing the conversion of my html static pages to ejs templates.
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 4040;

// Future improvement could be made. In the future, i would consider using promises opposed to callback functions for easier cleaner code and better integrations with async/await
// It would also of been better for me to make my pages as a ejs template first rather than playing with html pages and then converting to ejs templates. But done now
// Statically serving files from the public dir

// Make view engine ejs
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/', siteRoutes);

app.listen(PORT, () => {
    console.log('Server running on port: ${PORT}');
});