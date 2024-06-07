

class Order {
    constructor(items, total, userId) {
        this.userId = userId,
        this.date = new Date().getTime(),
        this.items = items,
        this.total = total
    }

}

export default Order;