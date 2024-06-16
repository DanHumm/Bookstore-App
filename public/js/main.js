import Cart from './classes/Cart.js';
import showNotification from './utils/notification.js';
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


    // Profile Page -- Order Specific

    if(document.querySelector('.order-card')) {
        document.querySelectorAll('.reveal-more > .btn').forEach((button) => {
            button.addEventListener('click', (e) => {
                let parent = e.target.parentElement.parentElement;
                parent.classList.toggle('reveal');
                if(parent.classList.contains('reveal')) {
                    button.innerText = "Show Less";
                }
                else {
                    button.innerText = "Show More";
                }
        })
    })

    document.querySelectorAll('.cancel-order-button').forEach((button) => {
        button.addEventListener('click', async (e) => {
            let notification = document.querySelector('#notification');
            let card = e.target.parentElement.parentElement;
            let orderNumber = e.target.parentElement.parentElement.dataset.orderNumber    
        try{
            const req = await fetch(`/orders/${orderNumber}`, {
                method: 'DELETE',
                body: orderNumber
            });

            let status = req.ok;

            const data = await req.json();
            let heading = data.heading;
            let summary = data.summary;
            let icon = data.icon;
        
            notification.classList = (status ? 'notification success' : 'notification error');
            notification.querySelector('i').classList = `fa-solid ${icon}`;
            notification.querySelector('h3').textContent = heading;
            notification.querySelector('p').textContent =  summary;
            
            card.style.opacity = "0";
            setTimeout(() => {
                card.classList.add('hidden');
                card.style.display = "none";
                if(!document.querySelector('.order-card:not(.hidden)')) {
                    document.querySelector('.orders').innerHTML = "<li> No orders to display! </li>";
                }
            }, 700);

            showNotification(notification);

    } catch(error) {
            console.log(error);
    }
    })
    });


}

}) // Onload

function validateForm() {
    console.log("Not validated!");
}