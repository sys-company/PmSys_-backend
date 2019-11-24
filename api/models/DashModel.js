'use strict';

const { query } = require('./utilModel');
const connection = require('../configs/connection');

class DashModel{

    async select() {
            const sql = `
            
            
            
            `;

            let dashData = await query(connection, sql);
            return dashData.recordsets[0];
        }

    }


    module.exports = DashModel;