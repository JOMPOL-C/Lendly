const prisma = require('../prisma/prisma');

exports.create = async (req, res) => {
try {
    const { product_name, price } = req.body
    const newProduct = await prisma.product.create({
        data: {
            product_name: product_name,
            price: price
        },
    });
    res.send(newProduct);
} catch(err) {
    console.log(err);
}
};

exports.list = async (req, res) => {
    try {
        res.send('Controllers LIST');
    } catch(err) {
        console.log(err);
    }
};

exports.read = async (req, res) => {
    try {
    const { productId } = req.params;
    console.log(productId);
    res.send(`Get product with ID: ${productId}`);
    } catch(err) {
    console.log(err);
    }
};

exports.update = async (req, res) => {
    try {
    res.send('Controllers UPDATE');
    } catch(err) {
    console.log(err);
    }
};

exports.remove = async (req, res) => {
    try {
    res.send('Controllers DELETE');
    } catch(err) {
    console.log(err);
    }
};