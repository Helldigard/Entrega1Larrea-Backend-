const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const cart = new Cart({ products: [] }); // Crea un carrito vacío
        await cart.save();
        console.log("Carrito creado con ID:", cart._id); // Muestra el ID del carrito en la consola
        res.status(201).json(cart);
    } catch (error) {
        res.status(500).json({ error: "Error al crear el carrito" });
    }
});

// Ruta para crear un carrito
router.post("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await Cart.findById(cid);

        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
        if (productIndex === -1) {
            cart.products.push({ product: pid, quantity: 1 });
        } else {
            cart.products[productIndex].quantity += 1;
        }

        await cart.save();
        res.json({ message: "Producto agregado al carrito", cart });
    } catch (error) {
        res.status(500).json({ error: "Error al agregar el producto al carrito" });
    }
});

// Ruta para obtener un producto específico dentro de un carrito
router.get("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const cart = await Cart.findById(cid).populate("products.product");
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

        const productInCart = cart.products.find(p => p.product._id.toString() === pid);
        if (!productInCart) return res.status(404).json({ error: "Producto no encontrado en el carrito" });

        res.json(productInCart);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el producto del carrito" });
    }
});

// Ruta para obtener todos los carritos
router.get("/", async (req, res) => {
    try {
        const carts = await Cart.find().populate("products.product"); // Obtiene todos los carritos
        res.json(carts);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los carritos" });
    }
});


router.get("/:cid", async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate("products.product"); 
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el carrito" });
    }
});

// Elimina un producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await Cart.findById(cid);
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

        cart.products = cart.products.filter(p => p.product.toString() !== pid);
        await cart.save();
        res.json({ message: "Producto eliminado del carrito", cart });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el producto del carrito" });
    }
});

// Actualiza el carrito con un arreglo de productos
router.put("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body; // array
        
        if (!Array.isArray(products)) {
            return res.status(400).json({ error: "El cuerpo debe ser un array de productos" });
        }

        const cart = await Cart.findByIdAndUpdate(cid, { products }, { new: true });
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

        res.json({ message: "Carrito actualizado", cart });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el carrito" });
    }
});

// Actualiza cantidad de un producto en el carrito
router.put("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
        }

        const cart = await Cart.findById(cid);
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
        if (productIndex === -1) return res.status(404).json({ error: "Producto no encontrado en el carrito" });

        cart.products[productIndex].quantity = quantity;
        await cart.save();
        res.json({ message: "Cantidad actualizada", cart });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar la cantidad del producto" });
    }
});

// Vacia el carrito
router.delete("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await Cart.findByIdAndUpdate(cid, { products: [] }, { new: true });
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

        res.json({ message: "Carrito vaciado", cart });
    } catch (error) {
        res.status(500).json({ error: "Error al vaciar el carrito" });
    }
});



module.exports = router;

