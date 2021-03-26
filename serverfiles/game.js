var mysql = require('mysql');
module.exports = class Game {
    constructor(host, user, password, database) {
        this.host = host
        this.user = user
        this.password = password
        this.database = database
        this.colors = ["blue", "green", "yellow", "red"]
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

    async createNewGame(login) {
        let players = {
            blue: {
                nick: login,
                lastActive: null,
                state: 0,
            }
        }
        let pawns = {
            blue: [0, 1, 2, 3]
        }

        await this.createGameInDatabase(players, pawns)
    }

    async addToLastGame(login, lastGame) {
        console.log("add", lastGame)
        lastGame = this.addPlayer(login, lastGame)
        if (lastGame.players.red != undefined) {
            lastGame = this.startGame(lastGame)
        }

        await this.saveGameInDatabase(lastGame)
    }

    saveGameInDatabase(game) {
        let playersString = JSON.stringify(game.players)
        let pawnsString = JSON.stringify(game.pawns)

        let query = `UPDATE games SET players=${this.connection.escape(playersString)}, pawns=${this.connection.escape(pawnsString)}, started=${game.started} WHERE id=${game.id}`
        console.log(query)

        new Promise((resolve, reject) => {
            this.connection.query(query, function (err, result) {
                if (err) throw err;
                resolve(result)
            })
        });
    }

    addPlayer(login, lastGame) {
        let color
        if (lastGame.players.green == undefined) {
            color = "green"
        } else if (lastGame.players.yellow == undefined) {
            color = "yellow"
        } else {
            color = "red"
        }

        let player = {
            nick: login,
            lastActive: null,
            state: 0,
        }
        let pawns = [0, 1, 2, 3]

        lastGame.players[color] = player
        lastGame.pawns[color] = pawns
        return lastGame
    }

    startGame(lastGame) {
        for (let key in lastGame.players) {
            lastGame.players[key].state = 3
        }
        lastGame.players.blue.state = 4

        lastGame.started = "1"
        return lastGame
    }

    createGameInDatabase(players, pawns) {
        let playersString = JSON.stringify(players)
        let pawnsString = JSON.stringify(pawns)

        let query = `INSERT into games(players, pawns, started) values(${this.connection.escape(playersString)}, ${this.connection.escape(pawnsString)}, "0")`

        console.log(query)
        new Promise((resolve, reject) => {
            this.connection.query(query, function (err, result) {
                if (err) throw err;
                resolve(result)
            })
        });
    }

    async login(login) {

        let lastRecord = await this.getLastRecord()
        if (lastRecord.players == undefined || lastRecord.players.red != undefined || lastRecord.started == "1") {
            console.log("tworzenie nowej gry")
            await this.createNewGame(login)
        } else {
            console.log("dodanie do ostatniej gry")
            await this.addToLastGame(login, lastRecord)
        }
        return await this.getLastRecord()
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


    async changeUserReadyState(id, color) {
        let game = await this.getGameFromId(id)
        if (game.players[color].state == 0) {
            game.players[color].state = 1
        } else {
            game.players[color].state = 0
        }

        let readyCount = 0
        for (let key in game.players) {
            if (game.players[key].state != 0) {
                readyCount++
            }
        }
        if (readyCount > 1) {
            this.startGame(game)
        }

        this.saveGameInDatabase(game)

        return game
    }

}
