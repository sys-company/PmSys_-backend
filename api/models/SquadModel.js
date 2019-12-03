'use strict';

const { query } = require('./utilModel');
const connection = require('../configs/connection');

class SquadModel {

    async select(id) {

        const sql = `
            SELECT
                idSquad AS id,
                apelidoSquad AS nome,
                areaSquad AS area,
                Descricao AS descricao,
                Objetivo AS objetivo
            FROM  tblSquad
            WHERE fkConta = ${id};
        `;

        let listaSquads = await query(connection, sql);
        return listaSquads.recordsets[0];

    }

    async index(id, idSquad) {

        const sql = `
            SELECT
                apelidoSquad nome,
                areaSquad area,
                Descricao descricao,
                objetivo objetivo,
                f.idFuncionario idFuncionario,
                f.nomeFuncionario nomeFuncionario,
                f.sexo sexoFuncionario,
                c.nomeCargo as cargo
            FROM tblSquad s
            INNER JOIN tblFuncionario f ON s.idSquad = f.fkSquad
            INNER JOIN tblCargo c
            ON f.fkCargo = c.idCargo
            WHERE s.fkConta = ${id} AND s.idSquad = ${idSquad}
            
        `;

        let squad = await query(connection, sql);
        return squad.recordsets[0];

    }

    async create(apelido, area, descricao, objetivo, id) {

        const sql = `
            INSERT
            INTO tblSquad(apelidoSquad, areaSquad, Descricao, Objetivo, fkConta)
            VALUES
            ('${apelido}', '${area}', '${descricao}', '${objetivo}', ${id});
        `;

        await query(connection, sql);

    }

    async update(apelido, area, descricao, objetivo, id) {

        const sql = `
        UPDATE
        tblSquad
        SET
        apelidoSquad = '${apelido}', areaSquad = '${area}', Descricao = '${descricao}', Objetivo = '${objetivo}'
            WHERE
            idSquad = ${id}
            `;

        await query(connection, sql);

    }

    async delete(idSquad, id) {
        const sql = `
            DELETE
            FROM tblSquad
            WHERE idSquad = ${idSquad}
            AND fkConta = ${id}
        `;

        await query(connection, sql);
    }

    async funcionarioSquad() {
        const sql = `
            SELECT idFuncionario, nomeFuncionario FROM tblFuncionario WHERE fkSquad = NULL
            `;

        let response = await query(connection, sql);
        return response.recordsets[0];

    }

    async addFuncionarioSquad(listFunc) {
        const sql = `
        UPDATE 
        tblFuncionario
        SET
        fkSquad = @@identity
        WHERE idFuncionario
        IN
        (${listFunc})
        `;
        await query(connection, sql);
    }

    async updateFuncionarioSquad(listFunc, fkSquad) {
        const sql = `
        UPDATE 
                tblFuncionario
                SET
                fkSquad = ${fkSquad}
                WHERE idFuncionario
                IN
                (${listFunc})
                `;
        await query(connection, sql);
    }

    async removeFuncionarioSquad(listFunc) {
        const sql = `
            UPDATE 
                tblFuncionario
            SET
             fkSquad = null
            WHERE idFuncionario
            IN
            (${listFunc})
        `;
        await query(connection, sql);
    }

    async deleteSquad(id){

        const sql = `
        DELETE FROM
            tblSquad
        WHERE
            idSquad = ${id}
    
        `;
    
            await query(connection, sql);
        }

        async selectData(id){
            const sql = `
            SELECT
	        AVG(RAMZ.PERCENT_RAM) AS PERCENT_SQUAD
        FROM (
		SELECT
		   ROUND((R.totalRamUsado / R.totalRam)* 100, 2) AS PERCENT_RAM
		   FROM tblInfoRAM AS R 
		  INNER JOIN tblMaquina AS M ON (R.fkMaquina = M.idMaquina)
		 INNER JOIN tblFuncionario AS F ON (M.idMaquina = F.fkMaquina)
		INNER JOIN tblSquad AS S ON (F.fkSquad = S.idSquad) WHERE S.idSquad = ${id})RAMZ;
            `;
            let response = await query(connection, sql);
            return response.recordsets[0];
            }

}

module.exports = SquadModel;