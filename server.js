const express = require("express");
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

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


/*  GET /api/carts → Devuelve todos los carritos guardados.
    GET /api/carts/:cid → Devuelve el carrito con el cid indicado.
    POST /api/carts → Crea un nuevo carrito vacío con un ID único.
    POST /api/carts/:cid/product/:pid → Agrega un producto al carrito:*/