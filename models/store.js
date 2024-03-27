const parser = require("node-html-parser");

class Store {
    constructor(storeName) {
        this.url = `https://www.${storeName}.com.br/?view=ecom/item&tcg=1&card=`;
    }

    async grabPrice(card) {
        console.log(await card.data)
        var id = card.data.then(function (data) {
            return data.id;
        });
        var url = this.url + (await id);
        return await fetch(url)
            .then(function (response) {
                switch (response.status) {
                    case 200:
                        return response.text();
                    case 404:
                        throw response;
                }
            })
            .then(function (html) {
                const page = parser.parse(html);

                const qnts = html.match(/([0-9]{1,2}) unid\./g);
                const cardPrecos = page.querySelectorAll(".card-preco");
                var precosComEstoque = [];
                for (let index = 0; index < cardPrecos.length; index++) {
                    var cardPreco;

                    cardPreco = cardPrecos[index].textContent
                        .trim()
                        .split("\n");

                    const qnt = Number(qnts[index].split(" ")[0]);
                    if (cardPreco.length == 1 || qnt == 0) {
                        continue;
                    }
                    var preco;
                    try {
                        preco = Number(
                            cardPreco[1].trim().split(" ")[1].replace(",", ".")
                        );
                    } catch (e) {
                        if (e instanceof TypeError) {
                            cardPreco = cardPrecos[index].innerHTML
                                .match(
                                    /<font color='red'>R\$ ([0-9]+,[0-9]+)/
                                )[1]
                                .replace(",", ".");
                            preco = Number(cardPreco);
                        } else {
                            throw e;
                        }
                    }
                    precosComEstoque.push(preco);
                }
                return Math.min(...precosComEstoque);
            })
            .catch(function (error) {
                console.log(error);
            });
    }
}

module.exports = Store;