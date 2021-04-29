import Player from "./Player.js"

export default class Game {
    constructor() {
        this.colors = ["blue", "green", "yellow", "red"]
        this.players = []
    }

    init(obj) {
        this.id = obj.id
        this.started = obj.started == 1
        this.obj = obj
        this.me = this.whoIAm()
        this.ended = false
        this.generateHeader()
        this.interval = ""
        this.startRequestng()
        if (Object.keys(this.obj.players).length > 3) {
            this.startGame(obj)
        }
    }

    sendLogin() {
        let name = document.getElementById("loginInput").value
        if (name != "" && name.length < 16) {
            this.postData('/login', { name: name })
                .then(data => {
                    console.log(data);
                    let promptElement = document.getElementById("prompt")
                    promptElement.remove()
                    this.init(data)
                });
        } else {
            alert("Podaj prawidłowy nick")
        }
    }

    async postData(url, data = {}) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        return response.json();
    }

    whoIAm() {
        let me
        for (let key in this.obj.players)
            me = key
        return me
    }

    generateHeader() {
        let header = document.createElement("div")
        header.className = "header"

        if (!this.started) {
            let switchButton = document.createElement("div")
            switchButton.classList.add("switchButton")
            switchButton.addEventListener("click", () => {
                this.changeReadyState()
            })

            let dot = document.createElement("div")
            dot.className = "switchDot"
            switchButton.appendChild(dot)
            header.appendChild(switchButton)
        }
        document.body.appendChild(header)
        for (let key in this.obj.players) {
            this.addUser(this.obj, key)
        }
    }

    removeSwitch() {
        let btn = document.getElementsByClassName("switchButton")[0]
        if (btn)
            btn.remove()
    }

    startGame(data) {
        this.obj = data
        this.started = true
        this.removeSwitch()
        this.createBoard()
        this.players[0].addCounter()

        this.players.forEach(player => {
            player.setState(data.players)
            player.checkToAddButton()
        })
    }

    createBoard() {
        let board = document.createElement("div")
        board.id = "board"
        let img = document.createElement("img")
        img.src = "gfx/board.png"
        board.appendChild(img)
        document.body.appendChild(board)

        this.players.forEach(player => player.addPawns())

    }


    addUser(data, color) {
        if (color == "unknown")
            color = Object.keys(data.players)[Object.keys(data.players).length - 1]

        this.players.push(new Player(this, data, color))
    }

    changeReadyState() {
        this.postData('/changeState', { id: this.id, color: this.me })
            .then(data => {
                console.log(data);
                this.update(data)
            });
        let button = document.getElementsByClassName("switchButton")[0]
        if (this.obj.players[this.me].state == 0) {
            button.classList.add("switchButtonOn")

        } else if (this.obj.players[this.me].state == 1) {
            button.classList.remove("switchButtonOn")
        }
    }

    finishGame(color, nick) {
        this.ended = true
        clearInterval(this.interval)
        this.players.forEach(player => {
            player.removeCounter()
            if (player.button)
                player.button.remove()
        })

        let finishBoard = document.createElement("div")
        finishBoard.id = "finishBoard"
        finishBoard.style.boxShadow = `0px 4px 15px 2px #000000, inset 0px 0px 12px 2px ${color}`

        finishBoard.innerText = "Wygrał " + nick
        finishBoard.style.color = color
        document.body.appendChild(finishBoard)
        finishBoard.classList.add("fade")

    }

    startRequestng() {
        this.interval = setInterval(() => {
            this.postData('/check', { id: this.id })
                .then(data => {
                    this.update(data)
                });
        }, 1000)
    }

    update(data) {
        if (JSON.stringify(data) != JSON.stringify(this.obj)) {
            if (Object.keys(data.players).length > Object.keys(this.obj.players).length) {
                this.addUser(data, "unknown")
            }

            if (!this.started && data.started == 1) {
                this.startGame(data)
            }

            this.obj = data

            if (this.started) {
                this.players.forEach(player => player.update(data))
            }
            // console.log("data", data)
        }
    }
}
