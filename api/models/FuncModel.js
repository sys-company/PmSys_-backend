'use strict';

const { query } = require('./utilModel');
const connection = require('../configs/connection');

class FuncModel {

    async select() {

        const sql = `
        SELECT * FROM(
			SELECT
                F.idFuncionario as id,
                F.identificador as tag,
                F.nomeFuncionario as nome,
                F.sexo as sexo,
                F.inicioExpediente as entrada,
                C.nomeCargo as cargo,
                S.apelidoSquad as squad,
                F.fkMaquina as idMaquina,
                F.fkSquad as idSquad,
				CASE WHEN sf.horaSaiu is null then 1 else 0 end as [Online],
				DENSE_RANK() OVER(partition by F.idFuncionario, F.nomeFuncionario, F.identificador, F.sexo, F.inicioExpediente, C.nomeCargo, S.apelidoSquad, S.apelidoSquad, F.fkMaquina, F.fkSquad order by sf.idStatusFuncionario desc) as [rank]
            FROM tblFuncionario F
            LEFT JOIN tblCargo C
                ON F.fkCargo = C.idCargo
            LEFT JOIN tblSquad S
                ON F.fkSquad = S.idSquad
			LEFT JOIN tblStatusFuncionario sf 
				ON F.idFuncionario = sf.fkFuncionario
		) AS J
		WHERE J.[rank] = 1
        `;

        const listaFuncionarios = await query(connection, sql);
        return listaFuncionarios.recordsets[0];

    }

    async index(login, senha) {

        const sql = `
            SELECT idConta FROM tblConta WHERE login= '${login}' AND senha='${senha}';
        `;

        let response = await query(connection, sql);
        return response.recordsets[0];

    }

    async cargos() {
        const sql = `
            SELECT
                idCargo AS id,
                nomeCargo AS nome
            FROM tblCargo;
        `;

        const response = await query(connection, sql);
        return response.recordsets[0];
    }

    async maquinas() {
        const sql = `
            SELECT
                M.idMaquina AS id,	
                M.apelidoMaquina AS nome,	
                F.nomeFuncionario AS funcionario	
            FROM tblMaquina M	
            LEFT JOIN	
                tblFuncionario F	
                ON F.fkMaquina = M.idMaquina
        `;

        const response = await query(connection, sql);
        return response.recordsets[0];
    }

    async funcionarioSquad() {
        const sql = `
            SELECT idFuncionario as id,
            nomeFuncionario as nome FROM tblFuncionario WHERE fkSquad IS NULL
        `;

        let response = await query(connection, sql);
        return response.recordsets[0];

    }

    async createFunc(nome, identificador, maquina, cargo, squad, sexo, conta){

        const sql = `
        INSERT
            INTO tblFuncionario
                (identificador, nomeFuncionario, sexo, fkSquad, fkCargo, fkMaquina, fkConta, inicioExpediente)
        VALUES
            ('${identificador}', '${nome}', '${sexo}', ${Number(squad) || 'NULL'}, '${cargo}', ${Number(maquina) || 'NULL'}, ${conta}, '08:30:00')
        `;

        console.log(sql);

        await query(connection, sql);
    }

    async updateFunc(nome, identificador, maquina, cargo, squad, sexo, conta, id){

        const sql =`
        UPDATE
            tblFuncionario
        SET
            identificador = '${identificador}', nomeFuncionario = '${nome}', sexo = '${sexo}',
            fkSquad = ${Number(squad) || 'null'}, fkCargo = ${cargo}, fkMaquina = ${Number(maquina) || 'null'}, fkConta = ${conta}
        WHERE idFuncionario = ${id}

        `;

        await query(connection, sql);
    }

    async deleteFunc(id){

    const sql = `
    DELETE FROM
        tblFuncionario
    WHERE
        idFuncionario = ${id}

    `;

        await query(connection, sql);
    }

}

module.exports = FuncModel;