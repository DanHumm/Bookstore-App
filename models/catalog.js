
/*
A model can be a range of exported functions which interact with a data source, in this case a JSON file, or a class with methods or ORM.

getBooks
- Reads file
- If content exists, returns parsed JSON, otherwise returns an empty array.
- Returns callback function so that the content can be passed and used at right time in controller function. 
*/


const fs = require('fs');
const path = require('path');


exports.getBooks = (cb) => {
    const p = path.join(path.dirname(require.main.filename),
    'data',
    'books.json');

    fs.readFile(p, (err, data) => {
         if (err) {
            return cb([]);
         } 
         
         return cb(JSON.parse(data));
})
}