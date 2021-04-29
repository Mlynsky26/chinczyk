import Pawn from "./Pawn.js"

export default class Player {
    constructor(game, data, color) {
        this.game = game
        this.color = color
        // this.playerObj = this.game.obj.players[color]
        this.pawns = []
        this.state = data.players[this.color].state
        this.nick = data.players[this.color].nick
        this.pawns = []
        this.init()
    }
    init(data) {
        this.addToHeader(data)
    }

    addToHeader() {
        let header = document.getElementsByClassName("header")[0]
        this.div = document.createElement("div")
        this.div.className = "playerNick"
        this.div.id = this.color + "player"
        if (this.color == this.game.me) {
            this.me = true
            this.div.classList.add("me")
        }
        this.div.style.backgroundColor = this.color
        this.div.innerText = this.nick
        header.appendChild(this.div)
    }

    addPawns() {
        this.game.obj.pawns[this.color].forEach((pawn, i) => this.pawns.push(new Pawn(this.game, this, pawn, i)))
    }

    addCounter() {
        this.lastActive = this.game.obj.players[this.color].lastActive
        this.circle = document.createElement("div")
        this.circle.className = "counterCircle"
        this.circle.innerText = 60
        this.div.appendChild(this.circle)
        this.interval = setInterval(() => { this.counter() }, 1000)
    }

    removeCounter() {
        clearInterval(this.interval)
        if (this.circle)
            this.circle.remove()
    }

    checkToAddButton() {
        if (this.game.me == this.color && this.state == 4) {
            this.addButton()
        }
    }

    addButton() {
        this.button = document.createElement("div")
        this.button.id = "randomButton"
        this.button.innerText = "losuj"
        this.button.addEventListener("click", () => {
            this.button.remove()
            this.game.postData("/random", { id: this.game.id, color: this.color }).then(data => {
                this.random = data.random
                this.resetCounter(data.time)
                this.showNumberImage()
                this.showMoves()
            })
        })
        document.body.appendChild(this.button)
    }

    showNumberImage() {
        let utterance = new SpeechSynthesisUtterance(this.random);
        speechSynthesis.speak(utterance);
        this.img = document.createElement("img")
        this.img.src = `gfx/${this.random}.png`
        this.img.className = "randomNumber"
        document.body.appendChild(this.img)
        setTimeout(() => { this.removeNumberImage() }, 2500)
    }

    removeNumberImage() {
        if (this.img)
            this.img.remove()
    }
    checkSameColor(index) {
        let canPlace = true
        if (index > 43) {
            this.pawns.forEach(pawn => {
                if (index == pawn.index) {
                    canPlace = false
                }
            })
        }
        return canPlace
    }

    showMoves() {
        this.pawns.forEach(pawn => pawn.showMove(this.random))
        if (!this.canMove) {
            let obj = { id: this.game.id, color: this.color, startIndex: this.pawns[0].startIndex, index: this.pawns[0].index }
            console.log("player", obj)
            this.game.postData("/move", obj)
            this.random = 0
        }
        this.canMove = false
    }

    removeMoves() {

        this.img.remove()
        this.pawns.forEach(pawn => pawn.hideMove())
    }

    resetCounter(time) {
        this.lastActive = time
        this.circle.innerText = 60
    }

    counter() {
        let current = new Date().getTime()
        let time = 60 - Math.floor((current - this.lastActive) / 1000)
        this.circle.innerText = time
    }

    update(data) {
        if (!this.game.ended) {
            if (this.state == 4 && data.players[this.color].state == 5) {
                this.goAfk()
            } else if (this.state == 3 && data.players[this.color].state == 4) {
                this.addCounter()
                if (this.game.me == this.color)
                    this.addButton()
                this.state = 4
            } else if (this.state == 4 && data.players[this.color].state == 3) {
                this.removeCounter()
                this.state = 3
            } else if (data.players[this.color].state == 6) {
                this.game.finishGame(this.color, this.nick)
            }
        }
        this.pawns.forEach((pawn, i) => pawn.update(data.pawns[this.color][i]))
    }

    goAfk() {
        this.state = 5
        clearInterval(this.interval)
        this.circle.innerText = "AFK"
        if (this.button)
            this.button.remove()
        if (this.img)
            this.img.remove()
        this.pawns.forEach(pawn => pawn.hideMove())
    }

    setState(players) {
        this.state = players[this.color].state
    }
}