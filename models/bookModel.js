const fs = require('fs').promises;
const path = require('path');
const p = path.join(path.dirname(require.main.filename),
'data',
'books.json');


/*
FN: readBooks
- uses filesystem to read data from JSON file, parse it as JavaScript and then return to the controller function which called it.

Comments
- Replaces Catalog.getBooks(cb) function which used an anonymous callback function instead of promise based async/await.
- New code less verbose and easier to read, with additional error handling ('ENOENT' = File/Directory not found).
*/
async function readBooks() {
    try {
        let data = await fs.readFile(p, 'utf-8');
        if(!data || !data.length > 0) {
            return []
        }
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        } else {
            console.error('Error reading orders:', error);
            throw error;
        }
    }
} /* Expected Output: [] or [{}, {}, {}]  */

module.exports = {
    readBooks,
}