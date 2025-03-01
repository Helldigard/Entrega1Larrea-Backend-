const express = require('express');
const Product = require("../models/Product");

const router = express.Router();

// Paginación, filtros y ordenamiento
router.get("/", async (req, res) => {
    try {
        let { limit = 10, page = 1, sort, query } = req.query;
        limit = parseInt(limit);
        page = parseInt(page);

        let filter = {};
        if (query) {
            filter = { category: query }; 
        }

        let sortOption = {};
        if (sort === "asc") sortOption.price = 1;
        if (sort === "desc") sortOption.price = -1;

        const products = await Product.paginate(filter, {
            limit,
            page,
            sort: sortOption,
            lean: true
        });

        const response = {
            status: "success",
            payload: products.docs,
            totalPages: products.totalPages,
            prevPage: products.hasPrevPage ? products.prevPage : null,
            nextPage: products.hasNextPage ? products.nextPage : null,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.hasPrevPage ? `/api/products?page=${products.prevPage}` : null,
            nextLink: products.hasNextPage ? `/api/products?page=${products.nextPage}` : null
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al obtener productos" });
    }
});

// obtiene producto por id
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.render("productDetail", { product });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el producto" });
    }
});

// Agrega producto
router.post("/", async (req, res) => {
    try {
        const { title, description, code, price, stock, category, thumbnails, status } = req.body;
        if (!title || !description || !code || !price || stock === undefined || !category) {
            return res.status(400).json({ error: "Todos los campos son obligatorios excepto thumbnails." });
        }

        const newProduct = new Product({
            title,
            description,
            code,
            price,
            stock,
            category,
            thumbnails: thumbnails || [],
            status: status !== undefined ? status : true
        });

        await newProduct.save();
        res.status(201).json({ message: "Producto agregado con éxito", product: newProduct });
    } catch (error) {
        res.status(500).json({ error: "Error al agregar el producto" });
    }
});

// Actualizar producto
router.put("/:pid", async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.pid, req.body, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json({ message: "Producto actualizado con éxito", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el producto" });
    }
});

// Elimina un producto
router.delete("/:pid", async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.pid);

        if (!deletedProduct) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json({ message: "Producto eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el producto" });
    }
});

module.exports = router;
