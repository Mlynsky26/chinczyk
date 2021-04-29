
var Database = require('./Database.js');
module.exports = class Main {
    constructor(host, user, password, database) {
        this.colors = ["blue", "green", "yellow", "red"]
        this.database = new Database(host, user, password, database)
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

        await this.database.createGameInDatabase(players, pawns)
    }

    async addToLastGame(login, lastGame) {
        lastGame = this.addPlayer(login, lastGame)
        if (lastGame.players.red != undefined) {
            lastGame = this.startGame(lastGame)
        }

        await this.database.saveGameInDatabase(lastGame)
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
        let pawns = []

        let pawns = [0, 1, 2, 3]

        lastGame.players[color] = player
        lastGame.pawns[color] = pawns
        return lastGame
    }

    startGame(lastGame) {
        let time = new Date().getTime()
        for (let key in lastGame.players) {
            lastGame.players[key].state = 3
            lastGame.players[key].lastActive = time
        }
        lastGame.players.blue.state = 4

        lastGame.started = "1"
        return lastGame
    }

    async login(login) {

        let lastRecord = await this.database.getLastRecord()
        if (lastRecord.players == undefined || lastRecord.players.red != undefined || lastRecord.started == "1") {
            await this.createNewGame(login)
        } else {
            await this.addToLastGame(login, lastRecord)
        }
        return await this.database.getLastRecord()
    }

    async changeUserReadyState(id, color) {
        let game = await this.database.getGameFromId(id)
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
            game = this.startGame(game)
        }

        await this.database.saveGameInDatabase(game)
        return game
    }

    async getRandom(id, color) {
        let game = await this.database.getGameFromId(id)
        let time = new Date().getTime()
        game.players[color].lastActive = time

        let random = Math.floor(Math.random() * 6) + 1

        let data = { random, time }
        await this.database.saveGameInDatabase(game)
        return data
    }

    async movePlayer(id, color, startIndex, index) {
        let userGame = await this.database.getGameFromId(id)
        userGame.pawns[color][startIndex] = index

        let user
        let keys = Object.keys(userGame.players)
        for (let i = 0; i < keys.length; i++) {
            if (userGame.players[keys[i]].state == 4) {
                user = i
            }
        }
        userGame = this.checkKills(userGame, color, index, keys)

        userGame = this.checkPlayerFinish(userGame, color)
        userGame = this.nextUser(userGame, user, keys)
        await this.database.saveGameInDatabase(userGame)
        return userGame
    }

    checkPlayerFinish(userGame, color) {
        let finished = true
        userGame.pawns[color].forEach(pawn => {
            if (pawn < 44) {
                finished = false
            }
        })

        if (finished) {
            userGame.players[color].state = 6
        } else {
            userGame.players[color].state = 3
        }
        return userGame
    }

    getAbsolutePosition(index, color) {
        let offset = 0
        switch (color) {
            case "red": {
                offset = 0
                break
            }
            case "blue": {
                offset = 10
                break
            }
            case "green": {
                offset = 20
                break
            }
            case "yellow": {
                offset = 30
                break
            }
        }

        let field = index + offset
        if (field > 43) {
            field = field - 40
        }
        return field
    }

    checkKills(userGame, color, index, keys) {
        if (index > 3 && index < 44) {
            let field = this.getAbsolutePosition(index, color)

            keys.forEach(key => {
                if (key != color) {

                    userGame.pawns[key].forEach((pawn, i) => {
                        let fieldToCheck = this.getAbsolutePosition(pawn, key)
                        if (field == fieldToCheck && pawn < 44) {
                            userGame.pawns[key][i] = i
                        }
                    })
                }
            })
        }
        return userGame
    }


    async checkGame(id) {
        let userGame = await this.database.getGameFromId(id)
        if (userGame.started == 1) {
            let user
            let color
            let keys = Object.keys(userGame.players)
            for (let i = 0; i < keys.length; i++) {
                if (userGame.players[keys[i]].state == 4) {
                    user = i
                    color = keys[i]
                }
            }
            if (color) {
                let current = new Date().getTime()
                let last = userGame.players[color].lastActive
                let time = 60 - Math.floor((current - last) / 1000)
                if (time < 1) {
                    userGame.players[color].state = 5
                    userGame = this.nextUser(userGame, user, keys)

                    await this.database.saveGameInDatabase(userGame)
                }
            }
        }
        return userGame
    }

    nextUser(userGame, user, keys) {
        for (let i = 1; i < keys.length; i++) {
            let toCheck = i + user
            if (toCheck > keys.length - 1) {
                toCheck = toCheck - keys.length
            }
            if (userGame.players[keys[toCheck]].state == 3) {
                userGame.players[keys[toCheck]].state = 4
                userGame.players[keys[toCheck]].lastActive = new Date().getTime()
                break
            }

        }
        return userGame
    }
}
