'use strict';

const { query } = require('./utilModel');
const connection = require('../configs/connection');

class DashModel{

    async select(periodo) {
            const sql = `
			SELECT * FROM dashFinalizadoRadical WHERE PERIODO LIKE '%${periodo}%';
            `;

            let dashData = await query(connection, sql);
            return dashData.recordsets[0];
		}

		async selectHard(periodo) {
		const sql = `
		
		SELECT * FROM vwHard WHERE PERIODO LIKE '%${periodo}%';

		`;
		let dashHard = await query(connection, sql);
		return dashHard.recordsets[0];

		}


    }


    module.exports = DashModel;