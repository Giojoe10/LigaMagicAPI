const CardNaoEncontrado = require("./customExceptions");
const axios = require("axios");
const htmlEntities = require("html-entities");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

const HEADERS = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
};

class Card {
    constructor(cardName) {
        this.name = cardName;
        this.data = this.getPrices();
    }

    static async fromName(cardName) {
        let name = await Card.getScryfallName(cardName);
        if(name==undefined){
            return null;
        }else{
            return new Card(name);
        }
    }

    static async getScryfallName(cardName) {
        const parsedName = await Card.parseName(cardName);
        const url = `https://api.scryfall.com/cards/named?fuzzy=${parsedName}`;

        await sleep(1000);
        const response = await axios.get(url, {
            headers: HEADERS
        })

        const scryfallName = response.data.name;
        if(scryfallName == undefined){
            throw new CardNaoEncontrado(`The card ${cardName} was not found on Scryfall.`);
        }

        return scryfallName;
    }

    static parseName(cardName) {
        return cardName.replace(" ", "+").split("/")[0].trim();
    }

    async getPrices() {
        const url = `https://www.ligamagic.com.br/?view=cards/card&card=${Card.parseName(this.name)}`;

        await sleep(1000);
        console.log("Getting prices for " + this.name);

        const cloudflareScraper = await import('cloudflare-scraper');
        const response = await cloudflareScraper.default.get(url, {
            headers: HEADERS,
        })

        const page = response.body;
        const rawPrices = page.match(/var g_avgprice='(.+)'/);
        const id = page.match(/onclick="AlertaPreco.showPopup\(([0-9]+)\);"/)[1];
        const unfilteredPrices = JSON.parse(rawPrices[1]);
        const rawSets = [...page.matchAll(/<option value='([0-9]{2,})'>([^<]+)/gm)];
        var sets = {};
        rawSets.forEach(rawSet => {
            sets[rawSet[1]] = htmlEntities.decode(rawSet[2]);;
        });

        var prices = {};
        var cheapest = Infinity;
        for (const [key, value] of Object.entries(unfilteredPrices)) {
            if(value.precoMenor!=0){
                prices[sets[key]] = {Normal: value.precoMenor};
                if (value.precoMenor < cheapest) {
                    cheapest = value.precoMenor;
                }
            }
            if ("extras" in value){
                for (const [extraKey, extraValue] of Object.entries(value.extras)) {
                    if (!(sets[key] in prices)) {
                        prices[sets[key]] = {};
                    }
                    prices[sets[key]][EXTRA_KEYS[extraKey]] = extraValue.precoMenor;
                    if (extraValue.precoMenor < cheapest) {
                        cheapest = extraValue.precoMenor;
                    }
                }
            }
        }
        return {id, prices, cheapest}
    }
}

module.exports = Card;  