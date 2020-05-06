let sketch = (p) => {
    pg = p;
    let back = p.color(0, 0, 0);
    let front = p.color(255, 255, 255);
    let sectionX;
    let sectionY;
    let me = 'O';
    let chance = 'O';
    let mat = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    let movelog = []
    let blocked = true
    let qwe = 0;
    function drawFrame() {
        p.background(back);
        p.stroke(front);
        p.strokeWeight(p.height / 100);
        
        for (let i = 1; i < 3; ++i) {
            p.line(sectionX * i, p.height / 50, sectionX * i, p.height - p.height / 50);
            p.line(p.width / 50, sectionY * i, p.width - p.width / 50, sectionY * i)
        }
    }
    function drawGame() {
        for (let i = 0; i < mat.length; ++i) {
            for (let j = 0; j < mat[i].length; ++j) {
                if (mat[j][i] == 1) {
                    p.noFill();
                    p.strokeWeight(p.height / 100)
                    p.circle(sectionX / 2 + sectionX * i, sectionY / 2 + sectionY * j, sectionY * 2 / 3)
                } else if (mat[j][i] == -1) {
                    p.noFill();
                    p.strokeWeight(p.height / 100)
                    p.line(sectionX / 2 + sectionX * i - sectionX / 3, sectionY / 2 + sectionY * j - sectionY / 3, sectionX / 2 + sectionX * i + sectionX / 3, sectionY / 2 + sectionY * j + sectionY / 3)
                    p.line(sectionX / 2 + sectionX * i - sectionX / 3, sectionY / 2 + sectionY * j + sectionY / 3, sectionX / 2 + sectionX * i + sectionX / 3, sectionY / 2 + sectionY * j - sectionY / 3)
                }
            }
        }
    }
    p.setup = function() {
        p.createCanvas(300, 300);
        sectionX = (p.width - p.width / 25) / 3;
        sectionY = (p.height - p.height / 25) / 3;
        drawFrame()
        drawGame()
        // p.frameRate(1)
    }
    p.draw = function() {
        // drawFrame(p)
        drawFrame();
        drawGame();
        if ((blocked || me !== chance) && qwe % 20 == 0) {
            update();
        }
        qwe++;
        if (end() != false) {
            p.noLoop()
            send({
                status: 'finished',
                victor: end(),
            })
            document.getElementById("status").innerHTML = "finished : "
            if (end() == 0) {
                document.getElementById("status").innerHTML += "You Win"
            } else if (end() == 1) {
                document.getElementById("status").innerHTML += "You Lose"
            } else {
                document.getElementById("status").innerHTML += "It's a Tie"
            }
        }
        if (qwe >= 10000) {
            qwe = 0
        }
        
    }
    p.mouseClicked = () => {
        if (blocked) {
            return 1
        }
        if (chance === me) {
            pos = [-1, -1]
            for (let i = 0; i < mat.length; ++i) {
                if (p.mouseX > sectionX * i && p.mouseX < sectionX * (i + 1)) {
                    pos[1] = i;
                }
                if (p.mouseY > sectionY * i && p.mouseY < sectionY * (i + 1)) {
                    pos[0] = i;
                }
            }
            if (pos[0] == -1 || pos[1] == -1) {
                return 1
            } else {
                if (mat[pos[0]][pos[1]] != 0) {
                    return 1
                }
                if (me === "O") {
                    chance = "X"
                } else {
                    chance = "O"
                }
                movelog.push(pos)
                mat[pos[0]][pos[1]] = (me === "O") ? 1 : -1;
                send({
                    status: 'ongoing',
                    position: pos
                })
            }
            p.print(`${movelog}`)
        }
        return 0
    }

    function end() {
        if (movelog.length == 9) {
            return true
        }
        for (let i = 0; i < 3; ++i) {
            if (mat[i][0] != 0 && mat[i][0] === mat[i][1] && mat[i][1] === mat[i][2]) {
                if (mat[i][0] == 1) {
                    if (me === 'O') {
                        return 0
                    } else {
                        return 1
                    }
                } else {
                    if (me === 'O') {
                        return 1
                    } else {
                        return 0
                    }
                }
            }
            if (mat[0][i] != 0 && mat[0][i] === mat[1][i] && mat[1][i] === mat[2][i]) {
                if (mat[0][i] == 1) {
                    if (me === 'O') {
                        return 0
                    } else {
                        return 1
                    }
                } else {
                    if (me === 'O') {
                        return 1
                    } else {res.movelog.length - movelog.length
                        return 0
                    }
                }
            }
        }
        if (mat[0][0] != 0 && mat[0][0] === mat[1][1] && mat[1][1] === mat[2][2]) {
            if (mat[0][0] == 1) {
                if (me === 'O') {
                    return 0
                } else {
                    return 1
                }
            } else {
                if (me === 'O') {
                    return 1
                } else {
                    return 0
                }
            }
        }
        if (mat[0][2] != 0 && mat[0][2] === mat[1][1] && mat[1][1] === mat[2][0]) {
            if (mat[0][2] == 1) {
                if (me === 'O') {
                    return 0
                } else {
                    return 1
                }
            } else {
                if (me === 'O') {
                    return 1
                } else {
                    return 0
                }
            }
        }

        return false
    }

    function send(data) {
        p.httpPost(window.location.href, 'json', data, (res) => {})

    }
    function update() {
        p.httpPost(window.location.href, 'json', {}, (res) => {
            me = res.u;
            if (res.players.length == 2) {
                p.print("Resolved")
                p.print(res.players)
                blocked = false
                document.getElementById("players").innerHTML = ''
                for (i of res.players) {
                    document.getElementById("players").innerHTML += `<li>${i}</li>`
                }
                mat = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
                chance = 'O'
                for (let i = 0; i < res.movelog.length; ++i) {
                    mat[res.movelog[i][0]][res.movelog[i][1]] = (chance === 'O') ? 1 : -1
                    chance = (chance === 'O') ? 'X' : 'O'
                }
                movelog = res.movelog
                if (res.state === 'finished') {
                    if (end() === 1) {
                        document.getElementById("status").innerHTML = `${res.state} : You Lose`
                    } else if (end() === 0) {
                        document.getElementById("status").innerHTML = `${res.state} : You Win`
                    } else {
                        document.getElementById("status").innerHTML = `${res.state} : It's a Tie`
                    }
                } else {
                    document.getElementById("status").innerHTML = `${res.state} : ${res.verdict} : ${me}`
                }
            }
        })
    }
}

function getState() {

    let game = new p5(sketch, document.getElementById("can"))
}

getState()

