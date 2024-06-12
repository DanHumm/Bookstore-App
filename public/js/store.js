
import Cart from './classes/Cart.js';

window.addEventListener('DOMContentLoaded', async function () {

const cart = new Cart();

console.log(JSON.parse(cart.getItems()));

// Dialog DOM References
const dialog = document.querySelector('.book-modal');
const closeButton = document.querySelector(".book-modal .close");
let notification;

// Tracking Animation
let isAnimating = false;

// Book Data
let books = []

try{
    books = await getBooks();
} catch(err) {
    console.log(err);
    throw "It would seem that your application has befallen a terrible fate, the following inscription may aid you going forwards:" + err;
}

// Cards Representing Individual Books
const bookElements = document.querySelectorAll('.book');


bookElements.forEach(book => {
    let id = book.dataset.bookIndex;

    book.addEventListener('mousedown', (e) => {
        let image = book.querySelector(".book__image");
        if(e.target !== image && e.target !== book) {
            return;
        }
        updateModal(books, id, dialog);
        animateIn(dialog, isAnimating);
    })
})

closeButton.addEventListener("click", () => {
    animateOut(dialog, isAnimating);
});

dialog.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    if(e.currentTarget === e.target) {
        animateOut(dialog, isAnimating);
    }
})

let modalBtns = document.querySelectorAll('.btn--modal');

modalBtns.forEach((button) => {
    button.addEventListener('click', (e) => {

        // Bind Data to Model
        let currentBook = button.parentNode.parentNode;
        let id = currentBook.dataset.bookIndex;
        updateModal(books, id, dialog);

        // Animate In
        animateIn(dialog, isAnimating);
        
    })
})

 let basketButtons = document.querySelectorAll('.btn-basket');

 basketButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
    let currentBook = document.querySelector(`[data-book-index="${button.dataset.index}"]`);

    console.log(currentBook);

    let name = currentBook.querySelector('h3').textContent;
    let author = currentBook.querySelector('.book__author').textContent;
    let priceContent = currentBook.querySelector('.book__price').textContent;
    let price = priceContent.slice(2, priceContent.length);
    let id = currentBook.dataset.bookIndex;
    let imgPath = new URL(currentBook.querySelector('.book__image').src).pathname;
    let imgUrl = imgPath.substring(1, imgPath.length);


    console.log(id, name, author, price, "1", imgUrl);

    cart.addItem(id, name, author, price, "1", imgUrl);
    cart.updateDOM();
    if(dialog.open) {
        notification = document.querySelector('.dialog-inner > .notification');
    }
    else {
        notification = document.querySelector('.notification');
    }
    showNotification(notification, isAnimating);

    console.log(cart.getItems());
 })
});

});

async function getBooks() {
    let books = await fetch('/api/books');
    let result = await books.json();
    return result;
}


function animateOut(dialog, isAnimating) {
    if(isAnimating) {
        return;
    }
    isAnimating = true;
    dialog.style.transform = "scale(0.8)";
    dialog.style.opacity = "0";
    setTimeout(function() {
        isAnimating = false;
        document.body.classList.remove('fixed');
        dialog.close();
    }, 400)
}


function animateIn(dialog, isAnimating) {
    if(isAnimating) {
        return;
    }
    isAnimating = true;

    dialog.showModal();
    dialog.style.transform = "scale(1)";
    dialog.style.opacity = "1";
    setInterval(function() {
        isAnimating = false;
    }, 400);

}

// Update Book Content with Filtered Book Data
function updateModal(books, id, dialog) {
    let book = books.find((book) => book.id === id);
    dialog.querySelector('.btn-basket').dataset.index = book.id;
    dialog.querySelector('h2').innerHTML = book.title;
    dialog.querySelector('.author').innerHTML = book.author;
    dialog.querySelector('.description').innerHTML = book.description;
    dialog.querySelector('.price').innerHTML = "£" + book.price;
    dialog.querySelector('img').setAttribute('src', 'images/books/' + book.imgURL);
}

function showNotification(notification, isAnimating) {

    if(isAnimating) {
        return;
    }
    isAnimating = true;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
        isAnimating = false;
    }, 1000)
   
}
