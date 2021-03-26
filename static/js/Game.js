export default class Game {
    constructor() {

    }

    sendLogin() {
        let name = document.getElementById("loginInput").value

        console.log(name)
        console.log(this)
        if (name != "" && name.length < 16) {
            this.postData('/login', { name: name })
                .then(data => {
                    console.log(data);
                    let promptElement = document.getElementById("prompt")
                    promptElement.remove()

                    this.init(data)
                });
        } else {
            alert("Podaj prawidłowynick")
        }
    }


    async postData(url = '', data = {}) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        return response.json();
    }


    init(obj) {
        this.id = obj.id
        this.started = obj.started == 1
        this.obj = obj
        this.me = this.whoIAm()
        this.generateHeader()
        this.interval = ""
        this.startRequestng()
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
        for (let key in this.obj.players) {
            let div = document.createElement("div")
            div.className = "playerNick"
            div.id = key + "player"
            if (key == this.me) {
                div.classList.add("me")
            }
            div.style.backgroundColor = key
            div.innerText = this.obj.players[key].nick
            header.appendChild(div)
        }

        document.body.appendChild(header)
    }

    removeSwitch(data) {
        if (!this.started && data.started == 1) {
            let btn = document.getElementsByClassName("switchButton")[0]
            btn.remove()
        }
    }

    addUsers(data) {
        for (let key in data.players) {
            if (this.obj.players[key] == undefined) {
                let header = document.getElementsByClassName("header")[0]
                let div = document.createElement("div")
                div.className = "playerNick"
                div.id = key + "player"
                div.style.backgroundColor = key
                div.innerText = data.players[key].nick
                header.appendChild(div)
            }
        }


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

    startRequestng() {
        this.interval = setInterval(() => {
            this.postData('/check', { id: this.id })
                .then(data => {
                    // console.log(data);
                    this.update(data)
                });
        }, 1000)
    }

    update(data) {
        if (JSON.stringify(data) != JSON.stringify(this.obj)) {
            console.log("zmiana")
            this.removeSwitch(data)
            this.addUsers(data)

            this.obj = data
            this.started = this.obj.started == 1

            if (this.started) {
                console.log("sstarted")
            }
        }
    }
}