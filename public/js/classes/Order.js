

class Order {
    constructor(items, total, userId) {
        this.userId = userId,
        this.orderNo = this.generateUID(),
        this.date = new Date().getTime(),
        this.items = items,
        this.total = total
    }

    generateUID() {
        var firstPart = (Math.random() * 46656) | 0;
        var secondPart = (Math.random() * 46656) | 0;
        firstPart = ("000" + firstPart.toString(36)).slice(-3);
        secondPart = ("000" + secondPart.toString(36)).slice(-3);
        return firstPart + secondPart;
    }

}

export default Order;