const FuncModel = require('../models/FuncModel');

const list = async (req, res) => {

    model = new FuncModel();
    
    const listaFuncionarios  = await model.select();
    
    return res.status(200).json(listaFuncionarios);
}

const listFuncSquad = async (req, res) => {
    
    model = new FuncModel();

    const listaFuncionarios = await model.funcionarioSquad();

    return res.status(200).json(listaFuncionarios);

}

const getCargos = async (req, res) => {
    model = new FuncModel();

    const cargos = await model.cargos();

    return res.status(200).json(cargos);
}

const getMaquinas = async (req, res) => {
    model = new FuncModel();

    const cargos = await model.maquinas();

    return res.status(200).json(cargos);
}

const getSessions = async (req, res) => {
    
    const { login, senha } = req.body;

    model = new FuncModel();

    const session = await model.index(login, senha);

    if(session.length > 0) {
        return res.status(200).json(session);
    }else {
        return res.status(404).end();
    }

} 

const createFunc = async (req, res) => {
    const conta = req.headers.id;
    const { nome, identificador, maquina, cargo, squad, sexo } = req.body;
    model = new FuncModel();

    if(nome && identificador && cargo && sexo){

        await model.createFunc(nome, identificador, maquina, cargo, squad, sexo, conta);
        return res.status(201).end();

    } else {

        return res.status(400).end();
    
    }
}

const updateFunc = async (req, res) => {
    const { id } = req.query;
    const conta = req.headers.id;
    const { nome, identificador, maquina, cargo, squad, sexo } = req.body;
    model = new FuncModel();

    if(nome && identificador && cargo && sexo){

        await model.updateFunc(nome, identificador, maquina, cargo, squad, sexo, conta, id);
        return res.status(201).end();

    } else {

        return res.status(400).end();
    
    }
}

const deleteFunc = async (req, res) => {
    const { id } = req.query;
    model = new FuncModel();

    if(id){
        await model.deleteFunc(id);
        return res.status(204).end();

    } else {

        return res.status().end();
    }


}
module.exports = {
    list,
    getCargos,
    getMaquinas,
    getSessions,
    createFunc,
    updateFunc,
    listFuncSquad,
    deleteFunc,
};