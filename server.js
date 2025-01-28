const express = require("express");
const productsRouter = require("./routes/products");
const cartsRouter = require("./routes/carts");

const app = express();
const PORT = 8080;

app.use(express.json());

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

app.get("/", (req, res) => {
    res.send("Servidor funcionando correctamente");
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

/*  GET /api/carts → Devuelve todos los carritos guardados.
    GET /api/carts/:cid → Devuelve el carrito con el cid indicado.
    POST /api/carts → Crea un nuevo carrito vacío con un ID único.
    POST /api/carts/:cid/product/:pid → Agrega un producto al carrito:*/