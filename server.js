const express = require("express");
const connectDB = require("./config/db");
const { engine } = require("express-handlebars");
const http = require("http");
const { Server } = require("socket.io");
const productsRouter = require("./routes/products");
const cartsRouter = require("./routes/carts");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 8080;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); 

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");


const filePath = "./data/products.json";
const readProducts = () => JSON.parse(fs.readFileSync(filePath, "utf8") || "[]");


app.get("/", (req, res) => {
    const products = readProducts();
    res.render("home", { products });
});

app.get("/realtimeproducts", (req, res) => {
    res.render("realTimeProducts");
});

app.get("/products", (req, res) => {
    const products = readProducts();
    res.render("products", { products }); 
});

app.get("/carts", (req, res) => {
    res.render("carts"); 
});


io.on("connection", (socket) => {
    console.log("Un usuario se ha conectado");


    socket.emit("updateProducts", readProducts());

    socket.on("newProduct", (product) => {
        let products = readProducts();
        product.id = products.length ? products[products.length - 1].id + 1 : 1;
        products.push(product);
        fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
        
        io.emit("updateProducts", products);
    });

    socket.on("disconnect", () => {
        console.log("Un usuario se ha desconectado");
    });
});

app.use("/products", productsRouter);
app.use("/carts", cartsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/products", productsRouter);


server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const Cart = require("./models/Cart");

async function createInitialCart() {
    try {
        const cart = new Cart({ products: [] });
        await cart.save();
        console.log("Carrito inicial creado con ID:", cart._id);
    } catch (error) {
        console.error("Error al crear el carrito inicial:", error);
    }
}

createInitialCart();


/*  GET /api/carts → Devuelve todos los carritos guardados.
    GET /api/carts/:cid → Devuelve el carrito con el cid indicado.
    POST /api/carts → Crea un nuevo carrito vacío con un ID único.
    POST /api/carts/:cid/product/:pid → Agrega un producto al carrito:*/