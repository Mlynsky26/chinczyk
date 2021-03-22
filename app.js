var express = require("express");
var app = express()
const PORT = 3000;
var path = require("path")
var bodyParser = require('body-parser');
var mysql = require('mysql');

var dotenv = require("dotenv")
dotenv.config()


var con = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USERLOGIN,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

con.connect(function (err) {
    if (err) throw err;
});

app.use(bodyParser.urlencoded({ extended: true }))

app.get("/", function (req, res) {
    console.log("get")
    res.sendFile(path.join(__dirname + "/static/index.html"))

})

app.post("/login", async function (req, res) {
    console.log(req.body.name)
    let login = req.body.name

    // let lastRecord = getLastRecord()
    // if (lastRecord.player4) {
    //     createNewGame()
    // } else {
    //     addToLastGame(login)
    // }

    let thisLoginGame = await getLastRecord()
    console.log(thisLoginGame)

    res.send(JSON.stringify(thisLoginGame))

})

function getLastRecord() {
    return new Promise((resolve, reject) => {
        con.query("SELECT * FROM games ORDER BY id DESC LIMIT 1", function (err, result, fields) {
            if (err) throw err;
            result[0].data = JSON.parse(result[0].data)
            // console.log(result[0]);
            resolve(result[0])
        })
    });
}

app.use(express.static("static"))

app.listen(PORT, function () {
    console.log("to jest start serwera na porcie " + PORT)
})