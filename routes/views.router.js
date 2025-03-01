const express = require('express');
const router = express.Router();
const ProductManager = require('../dao/ProductManager');
const CartManager = require('../dao/CartManager'); 

const productManager = new ProductManager();
const cartManager = new CartManager();


router.get('/products', async (req, res) => {
const { page = 1 } = req.query;
const productsData = await productManager.getPaginatedProducts({ page });
res.render('index', productsData);
});


router.get('/products/:pid', async (req, res) => {
const product = await productManager.getProductById(req.params.pid);
if (!product) {
    return res.status(404).send('Producto no encontrado');
}
res.render('product', { product });
});


router.get('/carts/:cid', async (req, res) => {
const cart = await cartManager.getCartById(req.params.cid);
if (!cart) {
    return res.status(404).send('Carrito no encontrado');
}
res.render('cart', { cart });
});

module.exports = router;
