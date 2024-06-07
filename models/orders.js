const fs = require('fs');
const path = require('path');

exports.addOrder = (data, callback) => {
    const p = path.join(path.dirname(require.main.filename),
    'data',
    'orders.json');

    let items = JSON.parse(data.items);
    console.log(items.length);

    if(!items.length >= 1) {
        return callback(false);
    }

   fs.readFile(p, "utf8", (err, orders) => {
        if(err) throw err;
        let orderData = orders;

        if(!orderData.length >= 1) {
            orderData = [];
            orderData.push(data);
        }
        else {
            orderData = JSON.parse(orders);
            orderData.push(data);
        }

        fs.writeFile(p, JSON.stringify(orderData), (err) => {
            if(err) {
                throw err;
            }
        });
        
        return callback(true);
    });

}