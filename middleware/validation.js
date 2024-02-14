// Middleware for validation and sanitization - DH

const allowedSearchChars = /[^a-zA-Z0-9\s!#()+:,.?-]/g;
// Regex of characters that should be allowed when using the search functionality
// [^...] this negates character class, meaning matches any character NOT in the set.
// a-zA-Z0-9 alphanumeric characters that are allowed
// [!#()+:,.?-] some special chars allowed.
// \s whitespace chars
// the /g "global" ensures that all matches are replaced throughout, not just with the first match. ie - applied globally to the string

const allowedFormChars = /[^a-zA-Z0-9]/g;
// Bans anything that isnt a lowercase, uppercase or number.

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// ^ = start of string
// [^\s@] = one or more characters that arent whitespace, or @
// @ = matches @
// \. = matches .
// $ = end of string.
// Example | This regex ensures that emails are: example@example.something and prevents any of the following: fog 

const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
// ^ = start 
// (?=.*[a-z]) = This is called a positive look ahead assertion. Simple terms means it checks the pattern can be matched ahead in the string without consuming characters. ie- the character remains available for subsequent pattern matching. This one looks for the presence of lowercase char.
// (?=.*[A-Z]) = Same as above, but to check for an uppercase character.
// (?=.*\d) = Checks atleast one number is present.
// .{8,} = Matches against any character atleast 8 times, ensuring the length meets the minimum 8 character requirement.
// $ = end of string.

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

    return userInput;
};

// Validates email input based on email regex above.
const validateEmail = (reqEmail) => {
    newEmail = sanitizeInput(reqEmail, 0);
    return emailRegex.test(newEmail);
};

// Validates password input based on the password regex above.
const validatePassword = (reqPass) => {
    newPass = sanitizeInput(reqPass, 0);
    return passRegex.test(newPass);
};