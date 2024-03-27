const fs = require("fs");
const htmlEntities = require("html-entities");
const CardNaoEncontrado = require('./customExceptions')

const EXTRA_KEYS = {
    2: "Foil",
    3: "Promo",
    5: "Pre-Release",
    7: "FNM",
    11: "DCI",
    13: "Textless",
    17: "Assinada",
    19: "Buy-a-Box",
    23: "Oversize",
    29: "Alterada",
    31: "Foil Etched",
    37: "Misprint",
    41: "Miscut",
};

class Card {
    constructor(cardName) {
        this.name = cardName;
        this.data = this.getPrices();
    }

    static async fromName(cardName){
        let name = Card.getScryfallName(cardName)
        if (await name==undefined){
            return null
        }else{
            return new Card(await name)
        }
    }

    static async getScryfallName(cardName) {
        const url = `https://api.scryfall.com/cards/named?fuzzy=${await Card.parse(
            cardName
        )}`;
        var scryfallName = fetch(url)
            .then(function (response) {
                return response.json();
            })
            .then(function (scryfallData) {
                return scryfallData.name;
            });

        if (await scryfallName==undefined){
            throw new CardNaoEncontrado(`O card "${cardName} não foi encontrado!"`)
        }
    
        return await scryfallName;
    }

    static async parse(name) {
        return await name.replace(" ", "+").split("/")[0].trim();
    }

    async getPrices() {
        const url = `https://www.ligamagic.com.br/?view=cards/card&card=${await Card.parse(
            await this.name
        )}`;
        return fetch(url)
            .then(function (response) {
                switch (response.status) {
                    case 200:
                        return response.text();
                    case 404:
                        throw response;
                    default:
                        throw response;
                }
            })
            .then(function (html) {
                fs.writeFileSync("./page.html", html);
                var rawPrices = html.match(/var g_avgprice='(.+)'/);
                var id = html.match(
                    /onclick="AlertaPreco.showPopup\(([0-9]+)\);"/
                )[1];

                var unfilteredPrices = JSON.parse(rawPrices[1]);
                var rawSets = [
                    ...html.matchAll(/<option value='([0-9]{2,})'>([^<]+)/gm),
                ];
                var sets = {};
                rawSets.forEach((element) => {
                    sets[element[1]] = htmlEntities.decode(element[2]);
                });
                var prices = {};
                var menor = Infinity;
                for (const [key, value] of Object.entries(unfilteredPrices)) {
                    if (value.precoMenor != 0) {
                        prices[sets[key]] = { Normal: value.precoMenor };
                        if (value.precoMenor < menor) {
                            menor = value.precoMenor;
                        }
                    }
                    if ("extras" in value) {
                        for (const [extra_key, extra_value] of Object.entries(
                            value.extras
                        )) {
                            if (!(sets[key] in prices)) {
                                prices[sets[key]] = {};
                            }

                            prices[sets[key]][EXTRA_KEYS[extra_key]] =
                                extra_value.precoMenor;
                            if (extra_value.precoMenor < menor) {
                                menor = extra_value.precoMenor;
                            }
                        }
                    }
                }
                return { id, menor, prices };
            })
            .catch(function (e) {
                console.log(e);
            });
    }
}

module.exports = Card;