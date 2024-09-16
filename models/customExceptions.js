class CardNaoEncontrado extends Error{
    constructor(message){
        super(message)
        this.name = "CardNaoEncontrado"
    }
}

module.exports = CardNaoEncontrado