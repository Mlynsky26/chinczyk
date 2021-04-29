var express = require("express");
var app = express()
const PORT = 3000;
var path = require("path")

var dotenv = require("dotenv")
dotenv.config()

let Main = require("./serverfiles/Main.js")

var main = new Main(process.env.HOST, process.env.USERLOGIN, process.env.PASSWORD, process.env.DATABASE)

app.use(express.json())

app.get("/", function (req, res) {
    console.log("get")
    res.sendFile(path.join(__dirname + "/static/index.html"))

})

app.post("/login", async function (req, res) {
    console.log(req.body)
    let login = req.body.name
    let thisLoginGame = await main.login(login)
    res.send(JSON.stringify(thisLoginGame))
})

app.post("/check", async function (req, res) {
    let id = req.body.id
    // let userGame = await main.database.getGameFromId(id)
    let userGame = await main.checkGame(id)
    res.send(JSON.stringify(userGame))
})

app.post("/changeState", async function (req, res) {
    let id = req.body.id
    let color = req.body.color
    let userGame = await main.changeUserReadyState(id, color)
    res.send(JSON.stringify(userGame))
})
app.post("/random", async function (req, res) {
    let id = req.body.id
    let color = req.body.color
    let data = await main.getRandom(id, color)
    res.send(JSON.stringify(data))
})
app.post("/move", async function (req, res) {
    let id = req.body.id
    let color = req.body.color
    let startIndex = req.body.startIndex
    let index = req.body.index
    let data = await main.movePlayer(id, color, startIndex, index)
    res.send(JSON.stringify(data))
})

app.use(express.static("static"))

app.listen(PORT, function () {
    console.log("to jest start serwera na porcie " + PORT)
})