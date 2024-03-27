const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json")

const app = express();
const PORT = process.env.PORT || 80;

app.use(cors());
app.options("*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,OPTIONS");
    res.header(
        "Access-Control-Allow-Headers",
        "Authorization, Content-Lenght, X-Requested-With"
    );
    res.send(200);
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${req.ip}`);
    next();
});

const mtgRoutes = require("./routes/mtg");
app.use("/mtg", mtgRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.get("/", function(req,res){
    res.redirect("/docs")
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
