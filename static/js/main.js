import test from "/js/test.js"
function init() {
    let button = document.getElementById("loginButton")
    button.addEventListener("click", sendLogin)
    console.log("init")
    test()
}

document.body.addEventListener("load", init())

function sendLogin() {
    let name = document.getElementById("loginInput").value

    if (name != "") {
        console.log("aefafa")
        var xhttp = new XMLHttpRequest()

        xhttp.onreadystatechange = function () { //cały proces od request do response
            console.log(this.readyState)
            if (this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(this.responseText)
                console.log(response) //obiekt
            }
        }
        xhttp.open("POST", "/login", true)
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        xhttp.send(`name=${name}`)
    } else {
        alert("Podaj nick")
    }



}

