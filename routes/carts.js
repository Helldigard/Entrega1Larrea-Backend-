const express = require("express");
const fs = require("fs");

const router = express.Router();
const CARTS_FILE = "data/carts.json";

const readCarts = () => {
    if (!fs.existsSync(CARTS_FILE)) return [];
    const data = fs.readFileSync(CARTS_FILE, "utf-8");
    return JSON.parse(data);
};

const writeCarts = (carts) => {
    fs.writeFileSync(CARTS_FILE, JSON.stringify(carts, null, 2), "utf-8");
};

router.get("/", (req, res) => {
    const carts = readCarts();
    res.json(carts);
});

router.get("/:cid", (req, res) => {
    const carts = readCarts();
    const cart = carts.find(c => c.id === parseInt(req.params.cid));
    cart ? res.json(cart) : res.status(404).json({ error: "Carrito no encontrado" });
});

router.post("/", (req, res) => {
    const carts = readCarts();
    const newCart = {
        id: carts.length > 0 ? carts[carts.length - 1].id + 1 : 1, 
        products: []
    };
    carts.push(newCart);
    writeCarts(carts);
    res.status(201).json(newCart);
});

router.post("/:cid/product/:pid", (req, res) => {
    const carts = readCarts();
    const cartIndex = carts.findIndex(c => c.id === parseInt(req.params.cid));

    if (cartIndex === -1) {
        return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const productId = parseInt(req.params.pid);
    const productIndex = carts[cartIndex].products.findIndex(p => p.product === productId);

    if (productIndex !== -1) {
        carts[cartIndex].products[productIndex].quantity += 1;
    } else {
        carts[cartIndex].products.push({ product: productId, quantity: 1 });
    }

    writeCarts(carts);
    res.status(200).json(carts[cartIndex]);
});

module.exports = router;

