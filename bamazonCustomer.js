var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "vj4cxex6",
    database: "bamazon"
})

connection.connect(function (err) {
    if (err) throw err;
    displayProduct();
});


// Running this application will first display all of the items available for sale. Include the ids, names, and prices of products for sale.

function displayProduct() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        for (i = 0; i < results.length; i++) {
            console.log("Product ID: " + results[i].items_id +
                " || Product: " + results[i].product_name +
                " || Department: " + results[i].department_name +
                " || Cost: " + results[i].price +
                " || Stock: " + results[i].stock_quantity
            );
            console.log("-----------------------")
        }
        request();
    })
}

function request() {
    connection.query("SELECT * FROM products", function (err, results) {
        inquirer.prompt([{
                    name: "request",
                    type: "rawlist",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(results[i].product_name);
                        }
                        return choiceArray;
                    },
                    message: "Which product would you like to purchase?: "
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "How many would you like to purchase?: "
                }
            ])
            .then(function (answer) {
                var chosenItem;
                var itemPrice;
                var totalCost;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].product_name === answer.request) {
                        chosenItem = results[i];
                        if (results[i].stock_quantity < answer.quantity) {
                            console.log("Sorry, we don't have that many!");
                            connection.end();
                        } else {
                            totalCost = parseInt(results[i].price * answer.input);
                            var remainingQuantity = parseInt(results[i].stock_quantity - answer.quantity);
                            connection.query(
                                "UPDATE products SET ? WHERE ?",
                                [
                                    {
                                        stock_quantity: remainingQuantity
                                    },
                                    {
                                        items_id: chosenItem.items_id
                                    }
                                ],
                                function(error) {
                                    if (error) throw err;
                                    console.log("Congratulations, your item is on its way!");
                                    console.log("Your total comes to: " + parseInt(totalCost));
                                    connection.end();
                                }
                            )
                        }

                    }
                }

            })
    })
}



