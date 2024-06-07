import Cart from './classes/Cart.js';
import Order from './classes/Order.js';

let rendered = false;

const cart = new Cart();

window.addEventListener('DOMContentLoaded', () => {

   let deliveryOptions = document.querySelectorAll('input[name=delivery-options]');

   deliveryOptions.forEach((option) => {
    option.addEventListener('click', (e) => {
        cart.updateDOM();
    })
   })

   let orderBtn = document.getElementById('orderBtn');
   orderBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        let notification = document.querySelector('#order');
        let heading;
        let summary;
        let icon;
        let status

        if(JSON.parse(cart.getItems()).length > 0) {
            const req = await fetch('/orders/', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(new Order(cart.getItems(), cart.getTotalPrice(), 2))
       });  
            let data = await req.json();
            heading = data.heading;
            summary = data.summary;
            icon = data.icon;
            status = data.completed
        }
        else {
            heading = "Error! - No Items in Cart!";
            summary = "Please add items to your cart before making an order";
            icon = "fa-triangle-exclamation";
            status =  false
        }

    notification.classList = (status ? 'notification success' : 'notification error');
    notification.querySelector('i').classList = `fa-solid ${icon}`;
    notification.querySelector('h3').textContent = heading;
    notification.querySelector('p').textContent =  summary;
    notification.classList.toggle('show');

    showNotification(notification);

    cart.clear();
    cart.updateDOM();
    renderCartItems(cart);

    if(status === true) {
        setInterval(() => {
            window.location.href = '/profile';
        }, 1400)
    }
});


    // INITIAL RENDER
    renderCartItems(cart);

    
    // CART ITEMS -- BUILD AND RENDER CART ITEM CARDS
    function renderCartItems(cart) {
        const cartList = document.querySelector('.cart-items');
        const items = JSON.parse(cart.getItems());
        document.querySelector('.cart-indicator').textContent = items.length;
    
        if(!items.length > 0) {
            cartList.innerHTML = "";
            return;
        } 
    
        if(rendered) {
            return;
        }
    
        
        // Loop through cart items and create list items
         items.forEach(item => {
            // Create list item element
            const listItem = document.createElement('li');
            listItem.className = "cart-item";
            listItem.dataset.index = item.id;
    
            // Image
            const itemImage = document.createElement('img');
            itemImage.src = item.imgUrl;
            itemImage.setAttribute('alt', "Item image");
    
            listItem.appendChild(itemImage);
    
            // Title & Details
            const details = document.createElement('div');
            details.className = 'cart-text';
    
            const itemTitle = document.createElement('h3');
            const itemTitleText = document.createTextNode(item.name);
            itemTitle.appendChild(itemTitleText);
    
    
            const itemAuthor = document.createElement('p');
            const itemAuthorText = document.createTextNode(item.author);
            itemAuthor.appendChild(itemAuthorText);
    
    
            const itemPrice = document.createElement('p');
            itemPrice.className = "book__price";
            const itemPriceText = document.createTextNode(`£${item.price}`);
            itemPrice.appendChild(itemPriceText);
    
            details.appendChild(itemTitle);
            details.appendChild(itemAuthor);
            details.appendChild(itemPrice);
    
            listItem.appendChild(details);
    
            // Controls Container
            const cartControls = document.createElement('div');
            cartControls.className = "cart-item-controls";
            
            // Select Field
            const select = document.createElement('div');
            select.className = "select";
            
            // Select Button
            const selectButton = document.createElement('button');
            selectButton.className = "button-select";
            selectButton.setAttribute('role', "combobox");
            selectButton.setAttribute('aria-labelledby', "select button");
            selectButton.setAttribute('aria-haspopup', "listbox");
            selectButton.setAttribute('aria-expanded', false);
            selectButton.setAttribute('aria-controls', "select-dropdown");
    
            const buttonlabel = document.createElement('p');
            const buttonText = document.createTextNode('Qty: ');
            buttonlabel.appendChild(buttonText);
    
            const selectedValue = document.createElement('span');
            selectedValue.className =  "selected-value";
            const selectedValueText = document.createTextNode(item.quantity);
            selectedValue.appendChild(selectedValueText);
    
            const buttonIcon = document.createElement('i');
            buttonIcon.className = "fa-sharp fa-solid fa-chevron-down";
    
            // Button Appends
            selectButton.appendChild(buttonlabel);
            selectButton.appendChild(selectedValue);
            selectButton.appendChild(buttonIcon);
    
    
            // Select Dropdown List
            const dropdownList = document.createElement('ul');
            dropdownList.className = "select-dropdown";
            dropdownList.setAttribute('role', 'listbox');
    
            // List Item - Option 1
            const qty = 5;
    
            for(let i=1; i<=qty; i++) {
    
                let sId = `${i}-${item.id}`;
    
                let listItem = document.createElement('li');
                listItem.setAttribute('role', 'option');
                listItem.className = "select-option";
                
                let input = document.createElement('input');
                input.type = "radio";
                input.id = sId;
                input.setAttribute('name', 'item-quantity');
    
    
                let label = document.createElement('label');
                label.setAttribute('for', sId);
                let labelText = document.createTextNode(i);
                label.appendChild(labelText);
    
                listItem.appendChild(input);
                listItem.appendChild(label);
    
                dropdownList.appendChild(listItem);
            }
    
            select.appendChild(selectButton);
            select.appendChild(dropdownList);
            cartControls.appendChild(select);
            
            listItem.appendChild(cartControls);
    
            let removeItemLink = document.createElement('a');
            removeItemLink.className = "remove-item";
            removeItemLink.setAttribute('href', "#");
            removeItemLink.dataset.id = item.id;
    
            let removeItemText = document.createTextNode('Remove Item');
            removeItemLink.appendChild(removeItemText);
    
    
            cartControls.appendChild(removeItemLink);
    
            // Append list item to cart list
            cartList.appendChild(listItem);
        });
    
        rendered = true;
    }


    // CART ITEM -- REMOVE ON CLICK
    const removeButtons = document.querySelectorAll('.remove-item');
    removeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            let container = document.querySelector('.cart-display');
            let itemId = this.getAttribute('data-id');
            cart.removeItem(itemId);
            removeItem(button, container).then(() => {
                cart.updateDOM();
                renderCartItems(cart);
            })
        });
    });

    // CART ITEM -- REMOVE FUNCTION
    function removeItem(button, container) {
        return new Promise((resolve) => {
            try {
            let parent = button.parentNode.parentNode;
            parent.classList.toggle('removed');
    
            console.log("The parent is: " + parent.dataset.index);
            setTimeout(function() {
                parent.remove();
                resolve();
            }, 350);
         } 
         catch(error) {
            reject(error);
            }
    });  
    } 



    // CART ITEM -- CUSTOM SELECT LIST
const selectBtns = document.querySelectorAll('.button-select');

selectBtns.forEach((button) => {
    button.addEventListener('click', (e) => {
        let select = e.target.parentNode;
        let options = select.querySelectorAll('.select-option');
        let selectedValue = select.querySelector('.selected-value');
        select.classList.toggle('active');
        button.setAttribute("aria-expanded", button.getAttribute("aria-expanded") === "true" ? "false" : "true");


        options.forEach((option) => {
            function handler(e) {
                 if(e.type === "click" && e.clientX !== 0 && e.clientY !== 0) {
                    // Update localStorage using Cart.update()
                    selectedValue.textContent = option.children[1].textContent;
                    select.classList.remove("active");
                    let itemId = select.nextElementSibling.dataset.id;
                    cart.updateItem(itemId, "quantity", option.children[1].textContent);
                 }
        
                 if(e.key === "Enter") {
                    // Update localStorage using Cart.update()
                    selectedValue.textContent = this.textContent;
                    select.classList.remove("active");
                 }
            }
            
            option.addEventListener('keyup', handler);
            option.addEventListener('click', handler);
        })
        
    })
})

function showNotification(notification, isAnimating) {

    if(isAnimating) {
        return;
    }
    isAnimating = true;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
        isAnimating = false;
    }, 4000)
   
}

})