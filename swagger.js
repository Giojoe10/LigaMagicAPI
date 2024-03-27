const swaggerAutogen = require("swagger-autogen")();

const doc = {
    info:{
        title: "LigaMagicAPI",
        description: "Uma API criada em Javascript (Node, Express) para obter os preços de cartas de Magic: The Gathering no Brasil, além de outras funcionalidades.",
        version: "1.0.0"
    },
    host: "localhost:3000"
}
const outpuFile = "./swagger-output.json";
const routes = ["./server.js"];

swaggerAutogen(outpuFile, routes, doc)