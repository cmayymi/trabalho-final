// erro com status HTTP, para a rota saber o que devolver
// compartilhado entre os controles (pedidos, relatorios, ...)
class ErroDeNegocio extends Error {
    constructor(mensagem, status = 400) {
        super(mensagem);
        this.status = status;
    }
}

module.exports = ErroDeNegocio;