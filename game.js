class Ball {

    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.radius = 10;
        this.startPosition();

        this.picturePath = "images/ball.png";
        this.picture = new Image();
        this.picture.src = this.picturePath;
    }
    startPosition() {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
        this.dx = 1;
        this.dy = -1;
    }
    drawBall() {
        this.ctx.beginPath();
        this.ctx.drawImage(this.picture, this.x - this.radius, this.y - this.radius, 2 * this.radius, 2 * this.radius);
        this.ctx.fillStyle = "blue";
        this.ctx.fill();
        this.ctx.closePath();
    }

    moveX() {
        this.x += this.dx;
    }
    moveY(paddleHeight = 0) {
        this.y += this.dy - paddleHeight;
    }

    changeXDirection() {
        this.dx = -this.dx;
    }

    changeYDirection() {
        this.dy = -this.dy;
    }

    isTouchLeft() {
        return this.x - this.radius <= 0;
    }

    isTouchRight() {
        return this.x + this.radius >= this.canvas.width;
    }

    isTouchTop() {
        return this.y - this.radius <= 0;
    }

    isTouchBottom() {
        return this.y + this.radius >= this.canvas.height;
    }

    /**
     * 
     * @param {Paddle} paddle 
     * @returns 
     */
    isTouchPaddle(paddle) {
        if (this.x >= paddle.x
            && this.x <= paddle.x + paddle.width
            && this.y + this.radius > this.canvas.height - paddle.height) {
            console.log("isTouchPaddle");
            return true;
        }
        return false;
    }
}

class Paddle {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.width = 100;
        this.height = 10;
        this.startPosition();
        this.paddleDx = 5;
        this.color = "yellow";
    }

    startPosition() {
        this.x = this.canvas.width / 2 - this.width / 2;
        this.y = this.canvas.height - this.height;
    }
    drawPaddle() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    moveLeft() {
        this.x -= this.paddleDx;
    }

    moveRight() {
        this.x += this.paddleDx;
    }

    canMoveRight() {
        return this.x + this.paddleDx + this.width < this.canvas.width;
    }

    canMoveLeft() {
        return this.x > 0;
    }
}

class Score {
    /** @var number */
    highScore;
    currScore;

    /** @var object */
    highScoreElem;
    currScoreElem;

    /** @var bool */
    isNewHighScore;

    constructor() {
        this.highScoreElem = document.getElementById("high-score-value");
        this.currScoreElem = document.getElementById("curr-score-value");
        this.scoreHandlers();

        this.startState();
    }

    showHighScore() {
        this.highScoreElem.innerText = this.highScore;
        if (this.isNewHighScore) {
            this.highScoreElem.classList.add("new-high-score");
        }
    }
    showCurrScore() {
        this.currScoreElem.innerText = this.currScore;
    }
    showScore() {
        this.showCurrScore();
        this.showHighScore();
    }
    updateScore() {
        this.currScore++;
        this.showCurrScore();

        if (this.currScore > this.highScore) {
            this.isNewHighScore = true;
            this.highScore = this.currScore;
            localStorage.setItem("highScore", this.highScore);
            this.showHighScore();
        }
    }

    startState() {
        this.highScore = localStorage.getItem("highScore");
        if (!this.highScore) {
            this.highScore = 0;
        }
        this.currScore = 0;
        this.isNewHighScore = false;
    }

    resetScore() {
        localStorage.removeItem("highScore");
        this.startState();
        this.showScore();
    }

    scoreHandlers() {
        let resetScoreButton = document.getElementById("reset-score-button");
        resetScoreButton.onclick = () => {
            if (confirm("Are you sure to reset scores?")) {
                this.resetScore();
            }
        }
    }
}

class GameControls {
    /** @var object */
    controlsWindow;
    startButton;

    /** @var bool */
    rightPressed = false;
    leftPressed = false;

    constructor() {
        this.controlsWindow = document.getElementById("controls-window");
        this.paddleHandlers();
    }

    /**
     * 
     * @param {Game} game 
     */
    createStartButton(game) {
        let controls_buttons = document.getElementById("controls-window__buttons");

        this.startButton = document.createElement("a");
        this.startButton.id = "start-game";
        this.startButton.classList.add("start-game");
        this.startButton.classList.add("button");
        this.startButton.innerText = "Start game";
        controls_buttons.append(this.startButton);
        this.startButton.onclick = () => {
            this.hideControlsWindow();
            game.gameStart();
        }
    }

    hideControlsWindow() {
        this.controlsWindow.classList.add("hide");
        this.controlsWindow.classList.remove("show");
    }
    showControlsWindow() {
        this.controlsWindow.classList.remove("hide");
        this.controlsWindow.classList.add("show");
    }

    /**
     * 
     * @param {String} message 
     */
    showMessage(message) {
        let messageElement = document.getElementById("controls-window__message");
        messageElement.innerHTML = message;
        messageElement.classList.add("show");
        messageElement.classList.remove("hide");
    }
    
    /**
     * Обработка нажатия клавиш "стрелка влево" и "стрелка вправо"
     */
    paddleHandlers() {
        document.onkeydown = (event) => {
            if (event.key == "ArrowRight") {
                this.rightPressed = true;
            } else if (event.key == "ArrowLeft") {
                this.leftPressed = true;
            }
        };
        document.onkeyup = (event) => {
            if (event.key == "ArrowRight") {
                this.rightPressed = false;
            } else if (event.key == "ArrowLeft") {
                this.leftPressed = false;
            }
        };
    }
}

class Game {
    /** @var HTMLCanvasElement */
    canvas;
    /** @var CanvasRenderingContext2D */
    ctx;
     
    /** @var GameControls */
    controls;

    /** @var Ball */
    ball;
    /** @var Paddle */
    paddle;
    /** @var Score */
    score;
    /** @var intervalID */
    timer;

    constructor() {
        this.canvas = document.getElementById("game-field");
        this.ctx = this.canvas.getContext("2d");

        this.controls = new GameControls();
        this.controls.createStartButton(this);
    }

    /**
     * Загрузка настроек игры
     */
    load() {
        this.ball = new Ball(this.canvas, this.ctx);
        this.paddle = new Paddle(this.canvas, this.ctx);
        this.score = new Score();

        this.score.showScore();
    }

    startState() {
        this.ball.startPosition();
        this.paddle.startPosition();
        this.score.startState();
        this.score.showScore();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ball.drawBall();
        this.paddle.drawPaddle();

        if (this.ball.isTouchRight() || this.ball.isTouchLeft()) {
            this.ball.changeXDirection();
        }

        if (this.ball.isTouchTop()) {
            this.ball.changeYDirection();
        } else if (this.ball.isTouchPaddle(this.paddle)) {
            this.ball.changeYDirection();
            this.score.updateScore();
        } else if (this.ball.isTouchBottom()) {
            this.gameOver();
        }

        if (this.controls.rightPressed && this.paddle.canMoveRight()) {
            this.paddle.moveRight();
        } else if (this.controls.leftPressed && this.paddle.canMoveLeft()) {
            this.paddle.moveLeft();
        }

        this.ball.moveX();
        if (this.ball.isTouchPaddle(this.paddle)) {
            this.ball.moveY(this.paddle.height);
        } else {
            this.ball.moveY();
        }
    }

    /**
     * Игра начата
     */
    gameStart() {
        this.startState();
        this.timer = setInterval(() => this.draw(), 10);
    }
    /**
     * Игра остановлена
     */
    gameStop() {
        clearInterval(this.timer);
    }
    /**
     * Игра завершена - пользователь проиграл
     */
    gameOver() {
        this.gameStop();
        let message = "Game Over!";
        if (this.score.isNewHighScore) {
            message += "<br>Wow! New high score!";
        }
        this.controls.showMessage(message);
        this.controls.showControlsWindow();
    }

}

let game = new Game();

game.load();