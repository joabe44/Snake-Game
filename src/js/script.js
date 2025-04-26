const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")

const score = document.querySelector(".score--value")
const finalScore = document.querySelector(".final-score > span")
const menu = document.querySelector(".menu-screen")
const buttonPlay = document.querySelector(".btn-play")

const audio = new Audio("./src/assets/audio.mp3")
const gameOverSound = new Audio("./src/assets/gameover.mp3");


const size = 30
const initialPosition = { x: 270, y: 240 }
let snake = [initialPosition]

const macaImage = new Image()
macaImage.src = "./src/images/maca.png"

const headImage = new Image()
headImage.src = "./src/images/head.png"

const bodyImage = new Image()
bodyImage.src = "./src/images/body.png"

const curveImage = new Image()
curveImage.src = "./src/images/curve.png"

const incrementScore = () => {
    score.innerText = +score.innerText + 10
}

const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min)
}

const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size)
    return Math.round(number / 30) * 30
}

const food = {
    x: randomPosition(),
    y: randomPosition(),
}

let direction, loopId

const drawGrid = () => {
    ctx.lineWidth = 1
    ctx.strokeStyle = "#191919"

    for (let i = 30; i < canvas.width; i += 30) {
        ctx.beginPath()
        ctx.lineTo(i, 0)
        ctx.lineTo(i, 600)
        ctx.stroke()

        ctx.beginPath()
        ctx.lineTo(0, i)
        ctx.lineTo(600, i)
        ctx.stroke()
    }
}

const drawFood = () => {
    ctx.drawImage(macaImage, food.x, food.y, size, size)
}

const moveSnake = () => {
    if (!direction) return

    const head = snake[snake.length - 1]
    const newHead = { x: head.x, y: head.y }

    if (direction === "right") newHead.x += size
    if (direction === "left") newHead.x -= size
    if (direction === "down") newHead.y += size
    if (direction === "up") newHead.y -= size

    snake.push(newHead)

    const ateFood = newHead.x === food.x && newHead.y === food.y

    if (ateFood) {
        incrementScore()
        audio.play()

        let x = randomPosition()
        let y = randomPosition()

        while (snake.some(segment => segment.x === x && segment.y === y)) {
            x = randomPosition()
            y = randomPosition()
        }

        food.x = x
        food.y = y
    } else {
        snake.shift()
    }
}
 
const drawSnake = () => {
    snake.forEach((position, index) => {
        ctx.save();
        ctx.translate(position.x + size / 2, position.y + size / 2);

        let rotation = 0;

        if (index === snake.length - 1) {
            // Cabeça
            if (direction === "right") rotation = 0;
            if (direction === "down") rotation = Math.PI / 2;
            if (direction === "left") rotation = Math.PI;
            if (direction === "up") rotation = -Math.PI / 2;

            ctx.rotate(rotation);
            ctx.drawImage(headImage, -size / 2, -size / 2, size, size);
        } else {
            // Corpo
            const prev = snake[index - 1] || position;
            const next = snake[index + 1] || position;

            if (prev.x === next.x) {
                // Movendo verticalmente
                if (position.y > next.y) rotation = -Math.PI / 2;
                else rotation = Math.PI / 2;
            } else if (prev.y === next.y) {
                // Movendo horizontalmente
                if (position.x > next.x) rotation = Math.PI;
                else rotation = 0;
            } else {
                // Curvas
                if (prev.x < position.x && next.y < position.y || next.x < position.x && prev.y < position.y) rotation = 0;
                else if (prev.y < position.y && next.x > position.x || next.y < position.y && prev.x > position.x) rotation = Math.PI / 2;
                else if (prev.x > position.x && next.y > position.y || next.x > position.x && prev.y > position.y) rotation = Math.PI;
                else if (prev.y > position.y && next.x < position.x || next.y > position.y && prev.x < position.x) rotation = -Math.PI / 2;

                ctx.rotate(rotation);
                ctx.drawImage(curveImage, -size / 2, -size / 2, size, size);
                ctx.restore();
                return;
            }

            ctx.rotate(rotation);
            ctx.drawImage(bodyImage, -size / 2, -size / 2, size, size);
        }

        ctx.restore();
    });
}


const checkCollision = () => {
    const head = snake[snake.length - 1]
    const canvasLimit = canvas.width - size
    const neckIndex = snake.length - 2

    const wallCollision =
        head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit

    const selfCollision = snake.find((position, index) => {
        return index < neckIndex && position.x === head.x && position.y === head.y
    })

    if (wallCollision || selfCollision) {
        gameOver()
    }
}

const gameOver = () => {
    direction = undefined
    menu.style.display = "flex"
    finalScore.innerText = score.innerText
    canvas.style.filter = "blur(2px)"
   
    gameOverSound.play();

}

const gameLoop = () => {
    clearInterval(loopId)

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawGrid()
    drawFood()
    moveSnake()
    drawSnake()
    checkCollision()

    const currentScore = parseInt(score.innerText, 10);
    const speed = Math.max(60, 150 - currentScore); // velocidade mínima de 60ms
          loopId = setTimeout(gameLoop, speed);
}

gameLoop()

document.addEventListener("keydown", ({ key }) => {
    if (key === "ArrowRight" && direction !== "left") direction = "right"
    if (key === "ArrowLeft" && direction !== "right") direction = "left"
    if (key === "ArrowDown" && direction !== "up") direction = "down"
    if (key === "ArrowUp" && direction !== "down") direction = "up"
})

buttonPlay.addEventListener("click", () => {
    score.innerText = "00"
    menu.style.display = "none"
    canvas.style.filter = "none"
    snake = [initialPosition]
    direction = undefined
})