const SquadModel = require('../models/SquadModel');


const list = async (req, res) => {

    const { id } = req.headers;

    const model = new SquadModel();
    
    if(id) {

        const listaSquads = await model.select(id);

        return res.status(200).json(listaSquads);

    }else{

        return res.status(400).end();
        
    }

}

const getSquad = async (req, res) => {

    const { idSquad } = req.query;
    const { id } = req.headers;

    const model = new SquadModel();

    if(id && idSquad) {
    
        let dadosSquad = await model.index(id, idSquad);
        const response = {"nome": dadosSquad[0].nome, "area": dadosSquad[0].area, "descricao": dadosSquad[0].descricao, "objetivo": dadosSquad[0].objetivo, "funcionarios": dadosSquad.map(dados => { return {"idFuncionario": dados.idFuncionario, "nomeFuncionario": dados.nomeFuncionario, "sexoFuncionario": dados.sexoFuncionario, "cargo": dados.cargo} })};

        return res.status(200).json(response);
    
    }else{

        return res.status(400).end();

    }
}

const createSquad = async (req, res) => {

    const { id } = req.headers;
    const { nome: apelido, area, descricao, objetivo, listFunc } = req.body;

    const model = new SquadModel();

    if(id && apelido && area && descricao && objetivo){

        await model.create(apelido, area, descricao, objetivo, id);
        
        if(listFunc.length) await model.addFuncionarioSquad(listFunc);
        
        return res.status(201).end();

    } else {

        return res.status(400).end();
    
    }

}

const updateSquad = async ( req, res ) => {

    const { id } = req.query;
    const { nome: apelido, area, descricao, objetivo, listFuncAdd, listFuncRemove } = req.body;
    const model = new SquadModel();

    if(id && apelido && area && descricao && objetivo){

        await model.update(apelido, area, descricao, objetivo, id);
        if(listFuncAdd.length) await model.updateFuncionarioSquad(listFuncAdd, id);
        if(listFuncRemove.length) await model.removeFuncionarioSquad(listFuncRemove); 
        return res.status(201).end();

    } else {

        return res.status(400).end();
    
    }
}

const deleteSquad = async ( req, res ) => {

    const { id } = req.headers;
    const { id: idSquad } = req.body;
    const model = new SquadModel();

    if(id && idSquad){

        await model.delete(idSquad, id);
        return res.status(204).end();

    } else {

        return res.status(400).end();
    
    }
}

module.exports = {
    list,
    getSquad,
    createSquad,
    updateSquad,
    deleteSquad,
};