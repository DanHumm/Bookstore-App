// Middleware for validating user-supplied input
const allowedSearchChars = /[^a-zA-Z0-9\s!#()+:,.?-]/g;
// Regex of characters that should be allowed when using the search functionality
// [^...] this negates character class, meaning matches any character NOT in the set.
// a-zA-Z0-9 alphanumeric characters that are allowed
// [!#()+:,.?-] some special chars allowed.
// \s whitespace chars
// the /g "global" ensures that all matches are replaced throughout, not just with the first match. ie - applied globally to the string

const allowedFormChars = /[^a-zA-Z0-9]/g;
// Bans anything that isnt a lowercase, uppercase or number.


const sanitizeInput = (userInput, action) => {
// 1. Check for null byte or encoded null byte or double encoded null byte and remove it if its present, and anything that comes after the null byte.
// 2. Remove any character that is not within my allowed character reg ex 
// If action = 1, then a search is being conducted and apply search validating rules. Otherwise assume form input and apply form validation
    if(action == 1){
        userInput = decodeURIComponent(userInput.replace(/%00||%2500|\\0|\\x00[\s\S]*$/g, ''));
        userInput = userInput.replace(allowedSearchChars, '');
    }
    else{
        userInput = decodeURIComponent(userInput.replace(/%00||%2500|\\0|\\x00[\s\S]*$/g, ''));
        userInput = userInput.replace(allowedFormChars, '');
    }

    
};