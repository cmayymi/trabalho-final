const db = require('../../database/conexao');
const CadastroIngrediente = require("./cadastro-ingrediente");
const FichaTecnica = require("./ficha-tecnica");
const ItemFicha = require("./item-ficha");

class CadastroFichaTecnica {
    buscarId(id) {
        const ficha = db.prepare('SELECT * FROM FichaTecnica WHERE id = ?').get(id);            // recupera o registro da ficha
        const cadastro_ingrediente = new CadastroIngrediente();                                 // para recuperar cada ingrediente
        if(!ficha) {
            return null;
        }
        const reg_item = db.prepare('SELECT * FROM ItemFicha WHERE fichaId = ?').all(ficha.id);             // como uma ficha pode ter varios ingredientes, utiliza all
        const itens =reg_item.map(item => {
            const ingrediente = cadastro_ingrediente.buscarId(item.ingredienteId);
            if (!ingrediente) {
                throw new Error(`Ingrediente de ID ${item.ingredienteId} não encontrado.`);
            }
            return new ItemFicha(item.quantidade, ingrediente);
            
        });
        return new FichaTecnica(ficha.id, itens);
    }
}

module.exports = CadastroFichaTecnica;