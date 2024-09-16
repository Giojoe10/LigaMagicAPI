const Card = require('../models/card');
const CardNaoEncontrado = require('../models/customExceptions');

async function getCard(req, res, next) {
    try {
        const card = await Card.fromName(req.params.cardName);
        await card.data;
        card.data.then(async function (response) {
            console.log(typeof await card.data)
            res.json(
                {
                    name: card.name,
                    id: response.id,
                    menor: response.cheapest,
                    prices: response.prices
                }
            );

        });
    }catch (e){
        if(e instanceof CardNaoEncontrado){
            res.status(404).send(e.message);
        }else{
            throw e
        }
    }
    next();
}


module.exports = {getCard}