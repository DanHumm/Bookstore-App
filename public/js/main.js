window.addEventListener('DOMContentLoaded', function () {
    // Global Definitions
    let menuButton = document.querySelector('.btn--hamburger');
    let dropDownMenu = document.querySelector('.site-nav');
    let myForm = document.querySelector('.login-form');
    let basketButtons = document.querySelectorAll('.add-to-basket');
    let basketIndicator = document.querySelector('p.indicator');
    let basketTotal = 0;


    // Setup
    updateBasket();


    // Form Validation
    if (myForm) {
        myForm.addEventListener('submit', validateForm);
    }


    // Event Listeners
    menuButton.addEventListener('click', (e) => {
        dropDownMenu.classList.toggle('open');
    })

    basketButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            basketTotal++
            updateBasket();
        })
    });

    function updateBasket() {
        if (!basketTotal >= 1) {
            basketIndicator.classList.remove('show')
        }
        else {
            basketIndicator.innerHTML = basketTotal;
            basketIndicator.classList.add('show');
        }
    }

    // When we resize the viewport above the media query to show the navigation, ensure the menu is not open. 
    // If it is open, close the menu by removing the 'open' class.
    window.addEventListener('resize', () => {
        let mql = window.matchMedia("(min-width: 600px)");
        if (mql.matches) {
            if (dropDownMenu.classList.contains('open')) {
                dropDownMenu.classList.remove('open');
            }
        }
    })

});


function validateForm(e) {
   // e.preventDefault();

    console.log(e);
}
