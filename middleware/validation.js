// Middleware for validation and sanitization - DH

const allowedSearchChars = /[^a-zA-Z0-9\s!#()+:,.?-]/g;
// Regex of characters that should be allowed when using the search functionality
// [^...] this negates character class, meaning matches any character NOT in the set.
// a-zA-Z0-9 alphanumeric characters that are allowed
// [!#()+:,.?-] some special chars allowed.
// \s whitespace chars
// the /g "global" ensures that all matches are replaced throughout, not just with the first match. ie - applied globally to the string

const allowedFormChars = /^[a-zA-Z0-9]+$/;
// Bans anything that isnt a lowercase, uppercase or number.

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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
        const decodedInput = decodeURIComponent(userInput);
        const sInput = decodedInput.replace(/%00|\0/g, ''); // Only remove null bytes
        return sInput;
    }
    else if (action == 0){
        const decodedInput = decodeURIComponent(userInput);
        const sInput = decodedInput.replace(/%00|\0/g, ''); // Only remove null bytes
        return sInput;
    }
    else{
        const decodedInput = decodeURIComponent(userInput);
        const sInput = decodedInput.replace(/%00|\0/g, ''); // Only remove null bytes
        return sInput;
    }

};

// Validates email input based on email regex above.
function validateEmail(reqEmail) {
    newEmail = sanitizeInput(reqEmail, 0);
    return emailRegex.test(newEmail);
};

// Validates password input based on the password regex above.
function validatePassword(reqPass) {
    newPass = sanitizeInput(reqPass, 2);
    console.log(newPass);
    return passRegex.test(newPass);
};

function validateUsername(reqUsername) {
    newUsername = sanitizeInput(reqUsername, 1);
    console.log(newUsername);
    return allowedFormChars.test(newUsername);
};
module.exports = {validateEmail, validatePassword, validateUsername};