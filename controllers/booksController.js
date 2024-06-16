const bookModel = require('../models/bookModel.js');


// ----------------------------------------------------- READ --------------------------------------------------------------------------------

async function getBooks(req, res) {
    try {
        const books = await bookModel.readBooks(); 
        console.log(books);
        return res.render('bookstore', {
            title: 'Store',
            books: books
        }); 
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

 async function getBooksJson(req, res, next)  {
    try {
        const books = await bookModel.readBooks(); 
        return res.json(books);
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

module.exports = {
    getBooks,
    getBooksJson
}
