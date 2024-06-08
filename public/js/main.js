import Cart from './classes/Cart.js';

const cart = new Cart();

window.addEventListener('DOMContentLoaded', async function () {

    // Global DOM Definitions
    let menuButton = document.querySelector('.btn--hamburger');
    let dropDownMenu = document.querySelector('.site-nav');
    let myForm = document.querySelector('.login-form');

    // Setup
    cart.updateDOM();

    // Form Validation
    if (myForm) {
        myForm.addEventListener('submit', validateForm);
    }

    // Event Listeners
    menuButton.addEventListener('click', (e) => {
        dropDownMenu.classList.toggle('open');
    })

    window.addEventListener('resize', () => {
        let mql = window.matchMedia("(min-width: 600px)");
        if (mql.matches) {
            if (dropDownMenu.classList.contains('open')) {
                dropDownMenu.classList.remove('open');
            }
        }
    })


}); 

function validateForm() {
    console.log("Not validated!");
}

function logout() {
    fetch('/logout', {
        method: 'POST'
    }).then(response => {
        if(response.ok){
            window.location.href='/';
        }
        else{
                console.error('Logout Failed');
        }
    });
}