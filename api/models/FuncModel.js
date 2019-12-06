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
                C.idCargo as idCargo,
                S.apelidoSquad as squad,
		        M.apelidoMaquina AS apelidoMaquina,
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
			LEFT JOIN tblMaquina M
				ON F.fkMaquina = M.idMaquina
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

    async createFunc(nome, identificador, maquina, cargo, squad, sexo){

        const sql = `
        INSERT
            INTO tblFuncionario
                (identificador, nomeFuncionario, sexo, fkSquad, fkCargo, fkMaquina, inicioExpediente)
        VALUES
            ('${identificador}', '${nome}', '${sexo}', ${squad || 'NULL'}, '${cargo}', ${maquina || 'NULL'}, '08:30:00')
        `;

        await query(connection, sql);
    }

    async getMaquina(apelidoMaquina){
        const sql = `
        SELECT 
        TOP 1
        idMaquina 
        FROM 
        tblMaquina
        WHERE
        apelidoMaquina = '${apelidoMaquina}'
        `;

        let response = await query(connection, sql);
        return response.recordsets[0][0].idMaquina;

    }

    async setMaquina(apelidoMaquina){
        const sql = `
        INSERT 
            INTO tblMaquina
                (apelidoMaquina)
        VALUES('${apelidoMaquina}')
        `;

        await query(connection, sql);

    }

    async updateFunc(nome, identificador, cargo, squad, sexo, id){

        const sql =`
        UPDATE
            tblFuncionario
        SET
            identificador = '${identificador}', nomeFuncionario = '${nome}', sexo = '${sexo}',
            fkSquad = ${squad || 'NULL'}, fkCargo = ${cargo}
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