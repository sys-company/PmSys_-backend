'use strict';

const query = (connection, sql, ...items) => new Promise((resolve, reject) => {

    if(Array.isArray(items[0])) items = items[0];

    connection.query(sql, items)
    .then(result => resolve(result))
    .catch(error => reject(error))
    
});

module.exports = { query };