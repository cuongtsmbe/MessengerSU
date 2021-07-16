const mysql = require('mysql');
const config = require("./../config/config.json");

module.exports = {
    load: function(sql) {
        return new Promise(function(resolve, reject) {
            var connection = mysql.createConnection(config.mysql);
            connection.connect();
            connection.query(sql, function(error, results, fields) {
                if (error) throw error;
                resolve(results);
            });

            connection.end();
        });
    },
    getAll: function(table) {
        return new Promise(function(resolve, reject) {
            var connection = mysql.createConnection(config.mysql);
            connection.connect();
            connection.query(`SELECT * from ${table}`, function(error, results, fields) {
                if (error) throw error;
                resolve(results);
            });

            connection.end();
        });
    },
    insert: function(table, data) {
        return new Promise(function(resolve, reject) {
            var connection = mysql.createConnection(config.mysql);
            connection.connect();
            connection.query(`INSERT INTO ${table} SET ?`, data, function(error, results, fields) {
                if (error) throw error;
                console.log("had insert row: " + results.insertId);
                resolve(results.insertId);
            });

            connection.end();
        });
    },
    getOneByCondition: function(table, condition) {
        return new Promise(function(resolve, reject) {
            var connection = mysql.createConnection(config.mysql);
            connection.connect();
            connection.query(`select * from ${table} where ?`, condition, function(error, results, fields) {
                if (error) throw error;
                resolve(results);
            });

            connection.end();
        });
    }



};