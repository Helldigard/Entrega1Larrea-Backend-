const express = require('express');
const fs = require('fs');
const router = express.Router();

const filePath = './data/products.json';


const readProducts = () => JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]');
const writeProducts = (products) => fs.writeFileSync(filePath, JSON.stringify(products, null, 2));


router.get('/', (req, res) => {
    let products = readProducts();
    if (req.query.limit) products = products.slice(0, parseInt(req.query.limit));
    res.json(products);
});


router.get('/:pid', (req, res) => {
    const product = readProducts().find(p => p.id === parseInt(req.params.pid));
    product ? res.json(product) : res.status(404).json({ error: "Producto no encontrado" });
});


router.post('/', (req, res) => {
    const { title, description, code, price, stock, category, thumbnails, status } = req.body;
    if (!title || !description || !code || !price || stock === undefined || !category) {
        return res.status(400).json({ error: "Todos los campos son obligatorios excepto thumbnails." });
    }
    const products = readProducts();
    const newProduct = {
        id: products.length ? products[products.length - 1].id + 1 : 1,
        title, description, code, price, stock, category,
        thumbnails: thumbnails || [], status: status !== undefined ? status : true
    };
    products.push(newProduct);
    writeProducts(products);
    res.status(201).json({ message: "Producto agregado", product: newProduct });
});


router.put('/:pid', (req, res) => {
    let products = readProducts();
    const index = products.findIndex(p => p.id === parseInt(req.params.pid));
    if (index === -1) return res.status(404).json({ error: "Producto no encontrado" });

    const updatedProduct = { ...products[index], ...req.body, id: products[index].id };
    products[index] = updatedProduct;
    writeProducts(products);
    res.json({ message: "Producto actualizado", product: updatedProduct });
});


router.delete('/:pid', (req, res) => {
    let products = readProducts();
    const filteredProducts = products.filter(p => p.id !== parseInt(req.params.pid));
    if (filteredProducts.length === products.length) return res.status(404).json({ error: "Producto no encontrado" });

    writeProducts(filteredProducts);
    res.json({ message: "Producto eliminado" });
});

module.exports = router;
