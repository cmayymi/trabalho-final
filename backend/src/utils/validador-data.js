// datas AAAA-MM-DD: validacao e data de hoje, compartilhadas entre pedidos e relatorios
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

    // data de hoje no formato AAAA-MM-DD (usa o fuso do servidor, nao UTC:
    // toISOString() daria o dia seguinte depois das 21h no horario de Brasilia)
    static hojeISO() {
        const agora = new Date();
        const mes = String(agora.getMonth() + 1).padStart(2, '0');
        const dia = String(agora.getDate()).padStart(2, '0');
        return `${agora.getFullYear()}-${mes}-${dia}`;
    }

    // true se fim >= inicio (as duas já validadas; AAAA-MM-DD compara como texto)
    static periodoValido(inicio, fim) {
        return fim >= inicio;
    }
}

module.exports = ValidadorData;