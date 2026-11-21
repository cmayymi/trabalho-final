// validacao de datas AAAA-MM-DD, compartilhada entre pedidos e relatorios
class ValidadorData {
    static #REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/; // formato AAAA-MM-DD (permite comparar como texto)

    // confere se é uma data real, não só o formato (ex.: 2026-02-31 é inválida)
    static dataValida(texto) {
        if (typeof texto !== 'string' || !ValidadorData.#REGEX_DATA.test(texto)) {
            return false;
        }
        const d = new Date(`${texto}T00:00:00Z`);
        return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === texto;
    }

    // true se fim >= inicio (as duas já validadas; AAAA-MM-DD compara como texto)
    static periodoValido(inicio, fim) {
        return fim >= inicio;
    }
}

module.exports = ValidadorData;