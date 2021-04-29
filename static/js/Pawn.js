let coordinates = [
    //Home
    // 0,1
    // 2,3
    { x: 31, y: 31 },
    { x: 83, y: 31 },
    { x: 31, y: 83 },
    { x: 83, y: 83 },

    //from home 4-8
    { x: 31, y: 239 },
    { x: 83, y: 239 },
    { x: 135, y: 239 },
    { x: 187, y: 239 },
    { x: 239, y: 239 },

    //9-12
    { x: 239, y: 187 },
    { x: 239, y: 135 },
    { x: 239, y: 83 },
    { x: 239, y: 31 },

    //13
    { x: 292, y: 31 },

    //14-17
    { x: 345, y: 31 },
    { x: 345, y: 83 },
    { x: 345, y: 135 },
    { x: 345, y: 187 },

    //18-22
    { x: 345, y: 239 },
    { x: 397, y: 239 },
    { x: 449, y: 239 },
    { x: 501, y: 239 },
    { x: 553, y: 239 },

    //23
    { x: 553, y: 292 },

    //24-28
    { x: 553, y: 345 },
    { x: 501, y: 345 },
    { x: 449, y: 345 },
    { x: 397, y: 345 },
    { x: 345, y: 345 },

    //29-32
    { x: 345, y: 397 },
    { x: 345, y: 449 },
    { x: 345, y: 501 },
    { x: 345, y: 553 },

    //33
    { x: 292, y: 553 },

    //34-37
    { x: 239, y: 553 },
    { x: 239, y: 501 },
    { x: 239, y: 449 },
    { x: 239, y: 397 },

    //38-42
    { x: 239, y: 345 },
    { x: 187, y: 345 },
    { x: 135, y: 345 },
    { x: 83, y: 345 },
    { x: 31, y: 345 },

    //43-47
    { x: 31, y: 292 },
    { x: 83, y: 292 },
    { x: 135, y: 292 },
    { x: 187, y: 292 },
    { x: 239, y: 292 },
]

export default class Pawn {
    constructor(game, player, index, startIndex) {
        this.game = game
        this.player = player
        this.color = player.color
        this.index = index
        this.startIndex = startIndex
        this.init()
    }
    init() {
        let board = document.getElementById("board")
        this.div = document.createElement("div")
        this.div.id = `pawn${this.color}${this.index}`
        this.div.className = "pawn"
        this.div.style.backgroundColor = this.color
        this.setPosition(this.index, "pawn")

        board.appendChild(this.div)
    }
    setPosition(index, type) {
        let coords = coordinates[index]
        let size = 584
        let x
        let y
        switch (this.color) {
            case "red": {
                x = coords.x
                y = coords.y
                break;
            }
            case "blue": {
                x = size - coords.y
                y = coords.x
                break;
            }
            case "green": {
                x = size - coords.x
                y = size - coords.y
                break;
            }
            case "yellow": {
                x = coords.y
                y = size - coords.x
                break;
            }
        }

        if (type == "pawn") {
            this.div.style.left = `${x}px`
            this.div.style.top = `${y}px`
            this.x = x
            this.y = y
            this.index = index
        } else if (type == "hint") {
            this.hint.style.left = `${x}px`
            this.hint.style.top = `${y}px`
        }
    }

    update(index) {
        if (this.index != index) {
            this.setPosition(index, "pawn")
        }
    }

    showMove(random) {
        this.canClick = true
        if (this.index < 4) {
            if (random == 1 || random == 6) {
                console.log("1 or 6")
                this.player.canMove = true
                this.highlight(4)
                this.canClick = true
                this.div.onclick = () => {
                    this.player.removeMoves()
                    let obj = { id: this.game.id, color: this.color, startIndex: this.startIndex, index: 4 }
                    if (this.canClick) {
                        this.canClick = false
                        this.player.random = 0
                        this.game.postData("/move", obj)
                    }
                }
            }
        } else {
            if (this.index + random < 48) {
                if (this.player.checkSameColor(this.index + random)) {
                    console.log("every move")
                    this.player.canMove = true
                    this.highlight(this.index + random)
                    this.canClick = true
                    this.div.onclick = () => {
                        console.log("test   ", this.player.random, "   ", this.index + random)
                        this.player.removeMoves()
                        let obj = { id: this.game.id, color: this.color, startIndex: this.startIndex, index: this.index + random }
                        console.log("klik ", obj.index, this.canClick)
                        if (this.canClick) {
                            this.canClick = false
                            this.player.random = 0
                            console.log(obj)
                            this.game.postData("/move", obj)
                        }
                    }
                }
            }
        }

    }
    hideMove() {
        if (this.interval)
            clearInterval(this.interval)
        if (this.hint)
            this.hint.remove()
        this.div.classList.remove("activePawn")
        this.div.style.cursor = "default"
    }

    highlight(index) {
        this.hint = document.createElement("div")
        this.hint.className = "hint"
        this.setPosition(index, "hint")
        let board = document.getElementById("board")
        board.appendChild(this.hint)
        this.div.style.cursor = "pointer"

        this.interval = setInterval(() => {
            this.div.classList.toggle("activePawn")
        }, 300)
    }

}