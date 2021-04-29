var mysql = require('mysql');
module.exports = class Database {
    constructor(host, user, password, database) {
        this.host = host
        this.user = user
        this.password = password
        this.database = database
        this.init()
    }

    init() {
        this.connection = mysql.createConnection({
            host: this.host,
            user: this.user,
            password: this.password,
            database: this.database
        });

        this.connection.connect(function (err) {
            if (err) throw err;
        });
    }

    getLastRecord() {
        return new Promise((resolve, reject) => {
            this.connection.query("SELECT * FROM games ORDER BY id DESC LIMIT 1", function (err, result, fields) {
                if (err) throw err;
                if (result.length > 0 && result[0].players != "") {
                    result[0].pawns = JSON.parse(result[0].pawns)
                    result[0].players = JSON.parse(result[0].players)
                }
                else
                    result[0] = {}
                resolve(result[0])
            })
        });
    }

    getGameFromId(id) {
        return new Promise((resolve, reject) => {
            this.connection.query(`SELECT * FROM games WHERE id = ${id}`, function (err, result, fields) {
                if (err) throw err;
                if (result.length > 0 && result[0].players != "") {
                    result[0].pawns = JSON.parse(result[0].pawns)
                    result[0].players = JSON.parse(result[0].players)
                }
                else
                    result[0] = {}
                resolve(result[0])
            })
        });
    }

    createGameInDatabase(players, pawns) {
        let playersString = JSON.stringify(players)
        let pawnsString = JSON.stringify(pawns)

        let query = `INSERT into games(players, pawns, started) values(${this.connection.escape(playersString)}, ${this.connection.escape(pawnsString)}, "0")`

        new Promise((resolve, reject) => {
            this.connection.query(query, function (err, result) {
                if (err) throw err;
                resolve(result)
            })
        });
    }

    saveGameInDatabase(game) {
        let playersString = JSON.stringify(game.players)
        let pawnsString = JSON.stringify(game.pawns)

        let query = `UPDATE games SET players=${this.connection.escape(playersString)}, pawns=${this.connection.escape(pawnsString)}, started=${game.started} WHERE id=${game.id}`

        new Promise((resolve, reject) => {
            this.connection.query(query, function (err, result) {
                if (err) throw err;
                resolve(result)
            })
        });
    }
}