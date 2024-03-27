const Card = require("../models/card");
const CardNaoEncontrado = require("../models/customExceptions");
const Store = require("../models/store")

async function getCard(req, res, next) {
    try {
        const card = await Card.fromName(req.params.cardName);
        await card.data
        card.data.then(async function (response) {
            res.json({
                name: card.name,
                id: response.id,
                menor: response.menor,
                prices: response.prices,
            });
        });
    } catch (e) {
        if (e instanceof CardNaoEncontrado){
            res.status(404).send(e.message)
        }
        else{
            throw e
        }
    }
    next();
}

async function getStorePrice(req, res, next) {
    try {
        const card = Card.fromName(req.params.cardName);
        const store = new Store(req.params.storeName);
        const menorPreco = await store.grabPrice(await card);
    
        res.json({
            menor_preco: menorPreco,
        });
    } catch (e) {
        if (e instanceof CardNaoEncontrado){
            res.status(404).send(e.message)
        }
        else{
            throw e
        }
    }
    next();
}

module.exports = {
    getCard,
    getStorePrice
}