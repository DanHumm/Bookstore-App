// CartItem class definition
class CartItem {
    constructor(id, name, author, price, quantity, imgUrl) {
        this.id = id;
        this.name = name;
        this.author = author;
        this.price = price;
        this.quantity = quantity;
        this.imgUrl = imgUrl ?  imgUrl : 'images/books/placeholder.png'
    }
}

// Cart class definition
class Cart {
    constructor(indicator) {
        this.deliveryCost = 0.10;
        this.vatPercentage = 1.20;
        this.indicator = indicator ?? document.querySelector('p.indicator');
        const storedCart = JSON.parse(localStorage.getItem('cart'));
        this.items = storedCart ? storedCart.map(item => new CartItem(item.id, item.name, item.author, item.price, item.quantity, item.imgUrl)) : [];
    }

    clear() {
        this.items = [];
        localStorage.clear();
    }

    getItems() {
        return JSON.stringify(this.items);
    }

    addItem(id, name, author, price, quantity = 1, imgUrl) {
        const existingItem = this.items.find(item => item.id === id);

        if (existingItem) {
            let quantity = existingItem.quantity;
            existingItem.quantity = Number(quantity) + 1;
        } else {
            const newItem = new CartItem(id, name, author, price, quantity, imgUrl);
            this.items.push(newItem);
        }
        this.saveCart();
    }

    removeItem(id) {
        const index = this.items.findIndex(item => item.id === id);

        if (index !== -1) {
            this.items.splice(index, 1);
            this.saveCart();
        }
    }
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        localStorage.setItem('total', JSON.stringify({
            total: this.getTotalPrice()
        }));
    }

    updateItem(index, property, value) {
        let newItems = this.items.map((item) => {  
             if(item.id == index) {
                item[property] = value;
             }
             return item;
        });
        this.items = newItems;
        this.saveCart();
        this.updateDOM();
    }

    getTotalPrice() {
       if(document.querySelector('input[name=delivery-options]')) {
            this.deliveryCost = document.querySelector('input[name=delivery-options]:checked').value;
       }

        if(this.items.length === 0) {
            return '0';
        }

        let total =  this.items.reduce((accumulator, item) => {
        const itemPrice = item.price;
            
            if (isNaN(itemPrice)) {
                console.error('Invalid item price detected:', item);
                return accumulator;
            }
            return accumulator + item.price * item.quantity;
          }, 0).toFixed(2);

        let subtotal =  Number(total) + Number(this.deliveryCost);
        let result = subtotal * this.vatPercentage;
        return result.toFixed(2);
    }

    updateDOM() {
        if(!this.items.length >= 1) {
            this.indicator.classList.remove('show');
            if(document.querySelector('.text-total')) {
                document.querySelector('.text-total').textContent = `Total Price: £0.00`;
            }
            return;
        }
        this.indicator.classList.add('show');
        this.indicator.textContent = this.items.length;

        if(document.querySelector('.text-total')) {
            document.querySelector('.text-total').textContent = `Total Price: £${this.getTotalPrice()}`;
        }
    }
}

export default Cart;