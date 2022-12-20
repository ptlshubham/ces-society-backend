
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ces_society"
});
exports.executeSql = function (sql, callback) {
    con.query(sql, function (err, result) {
        if (err) {
            // throw err;
            callback(null, err);
        }
        else {
            callback(result);
        }

    });

}
exports.executeSql1 = function (sql, values,callback) {
    con.query(sql, function (err, result) {
        if (err) {
            // throw err;
            callback(null, err);
        }
        else {
            callback(result);
        }

    });

}
