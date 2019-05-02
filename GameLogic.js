/*
board cell values:
    0-empty cell            1-pacman up               2-pacman down              3-pacman left     4-pacman right    
    5 - 5 points food       10 - 15 points food       15 - 25 points food        6-wall            7-ghost_1
    8-ghost_2               9-ghost_3                 11-moving score element    12-Lives          13-clock
*/

/* Initializing global variables */
var context, board, score, start_time, time_elapsed, interval, secondInterval, MovingScoreInterval, LivesInterval, ClockScoreInterval, numOf5pts, numOf10pts, numOf15pts, GameTime, GhostNum, BallsNumber,
    ColorOf5pts, ColorOf10pts, ColorOf15pts, ghost1, ghost2, ghost3, boardSize, GhostPositions, NumOfFouls, pacman_right, pacman_left, pacman_up, pacman_down, MovingScore, Lives, clock, upKey, downKey,
    leftKey, rightKey, SignUpWindow, LoginWindow, WelcomeWindow, UsersTable, GameWindow, GameOptionsWindow, AboutShowWindow, MainWindow, ContactWindow, audio, userInSystem, victory, WallImage, waitingTime,
    winnerAudio, gameOverAudio, lossAudio;
var ScorePositions; // 0- movingScore , 1-Lives , 2-clock
var shape = new Object();

/* Handling filling out a registration form for the game system */
$(function () {
    $.validator.setDefaults({
        errorClass: 'help-block',
        highlight: function (element) { /* Highlighting a text box in which the input is invalid */
            $(element)
                .closest('.form-group')
                .addClass('has-error');
        },
        unhighlight: function (element) { /* Removing the highlight from a text box where the previous input was invalid */
            $(element)
                .closest('.form-group')
                .removeClass('has-error');
        },
        errorPlacement: function (error, element) { /* Adds a screen error for the user */
            if (element.prop('type') === 'checkbox') {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        }
    });
    $.validator.addMethod('validUserName', function (value) { /* Check that there is no such user name in the system */
        for (let i = 0; i < UsersTable.length; i++) {
            if (UsersTable[i].username == value)
                return false;
            return true;
        };
    }, "This user name is already exists, please choose another user name.");

    $.validator.addMethod('validPassword', function (value) { /* Check password integrity */
        return value.match(/^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,}$/);
    }, "A password must contain at least 8 characters along with letters and numbers.");

    $.validator.addMethod('validFname', function (value) { /* First name integrity check */
        return value.match(/^[a-zA-Z]+$/);
    }, "First name must contain only letters without any numbers.");

    $.validator.addMethod('validLname', function (value) { /* Last name integrity check */
        return value.match(/^[a-zA-Z]+$/);
    }, "Last name must contain only letters without numbers.");

    $.validator.addMethod('noWhiteSpace', function (value) { /* Checking input spaces */
        return !value.match(/^$|\s+/);
    }, "This field can not contain spaces or be empty.");

    $.validator.addMethod('validDate', function (value) { /* Date integrity check */
        return value.match(/^(18[5-9][0-9]|19[5-9][0-9]|2000|2001|2002|2003|2004|2005|2006|2007|2008|2009|2010|2011|2012|2013|2014|2015|2016|2017|2018|2019)[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12][0-9]|3[01])$/);
    }, "Please enter a valid date.");

    $.validator.addMethod('validEmail', function (value) {  /* E-mail integrity check */
        return value.match(/^\w+([\.-]?\w+)+@\w+([\.:]?\w+)+(\.[a-zA-Z0-9]{2,3})+$/);
    }, "Please enter a valid e-mail.");

    $("form[name='signupForm']").validate({
        rules: {
            username: {
                required: true,
                noWhiteSpace: true,
                validUserName: true
            },
            password: {
                required: true,
                noWhiteSpace: true,
                validPassword: true
            },
            firstname: {
                required: true,
                noWhiteSpace: true,
                validFname: true
            },
            lastname: {
                required: true,
                noWhiteSpace: true,
                validLname: true
            },
            Email: {
                required: true,
                email: true,
                noWhiteSpace: true,
                validEmail: true
            },
            date: {
                required: true,
                date: true,
                validDate: true
            }
        },
        submitHandler: function () { /* Handling in the case of proper input when registering on the system */
            window.alert("You have successfully registered");
            let name = document.getElementById("firstname").value;
            let username = document.getElementById("username").value;
            let password = document.getElementById("password").value;
            UsersTable.push({ username, password, name });
            HomeWindow();
        }
    });

});

/* Initialize all the parameters for the game */
$(document).ready(function () {
    initialProperties();
    ResetProperties();
});

/* Set all game properties for the start of a game */
function Start() {
    let currName = "";
    for (var i = 0; i < userInSystem.length; i++) {
        if (userInSystem[i] !== undefined && userInSystem[i] !== '')
            currName += userInSystem[i];
    }
    document.getElementById("playerName").innerHTML = currName;


    ResetProperties();
    waitingTime = 0;
    context = canvas.getContext("2d");
    score = 0;
    var cnt = 100;
    var food_remain = BallsNumber;
    start_time = new Date();
    for (var i = 0; i < boardSize; i++) {
        board[i] = new Array();
        /* push walls on the board */
        for (var j = 0; j < boardSize; j++) {
            if ((i === 1 && j === 1) || (i === 1 && j === 2) || (i === 1 && j === 3) || (i === 2 && j === 3) || (i === 3 && j === 3)
                || (i === 1 && j === 7) || (i === 1 && j === 8) || (i === 1 && j === 9) || (i === 2 && j === 7) || (i === 3 && j === 7)
                || (i === 9 && j === 2) || (i === 9 && j === 3) || (i === 9 && j === 4) || (i === 8 && j === 4) || (i === 7 && j === 4)
                || (i === 8 && j === 8) || (i === 8 && j === 9) || (i === 7 && j === 8)) {
                board[i][j] = 6;
            }
            else if (CornerCell(i, j) == true) {
                board[i][j] = 0;
            }
            else { /* Spread the balls in the game board */
                var randomNum = Math.random();
                if ((randomNum < 1.0 * numOf5pts / cnt) && (numOf5pts > 0)) {
                    food_remain--;
                    numOf5pts--;
                    board[i][j] = 5;
                }
                else if ((randomNum < 1.0 * numOf10pts / cnt) && (numOf10pts > 0)) {
                    food_remain--;
                    numOf10pts--;
                    board[i][j] = 10;
                }
                else if ((randomNum < 1.0 * numOf15pts / cnt) && (numOf15pts > 0)) {
                    food_remain--;
                    numOf15pts--;
                    board[i][j] = 15;
                }
                else {
                    board[i][j] = 0;
                }
                cnt--;
            }
        }
    }
    board[0][0] = 7;
    if (GhostNum > 1) {
        board[boardSize - 1][boardSize - 1] = 8;
        GhostPositions.push([boardSize - 1, boardSize - 1, 0]);
        if (GhostNum > 2) {
            board[boardSize - 1][0] = 9;
            GhostPositions.push([boardSize - 1, 0, 0]);
        }
    }
    board[0][boardSize - 1] = 11;
    var emptyCell = findRandomEmptyCell(board);
    shape.i = emptyCell[0];
    shape.j = emptyCell[1];
    board[emptyCell[0]][emptyCell[1]] = 2;
    emptyCell = findRandomEmptyCell(board);
    board[emptyCell[0]][emptyCell[1]] = 12;
    ScorePositions.push([emptyCell[0], emptyCell[1], 0])
    emptyCell = findRandomEmptyCell(board);
    board[emptyCell[0]][emptyCell[1]] = 13;
    ScorePositions.push([emptyCell[0], emptyCell[1], 0]);
    var current_food_remain = food_remain;

    for (var i = 0; i < current_food_remain; i++) {
        if (numOf5pts > 0 && food_remain > 0) {
            emptyCell = findRandomEmptyCell(board);
            board[emptyCell[0]][emptyCell[1]] = 5;
            numOf5pts--;
            food_remain--;
        }
        else if (numOf10pts > 0 && food_remain > 0) {
            emptyCell = findRandomEmptyCell(board);
            board[emptyCell[0]][emptyCell[1]] = 10;
            numOf10pts--;
            food_remain--;
        }
        else if (numOf15pts > 0 && food_remain > 0) {
            emptyCell = findRandomEmptyCell(board);
            board[emptyCell[0]][emptyCell[1]] = 15;
            numOf15pts--;
            food_remain--;
        }
    }
    keysDown = {};
    addEventListener("keydown", function (e) {
        keysDown[e.code] = true;
        switch (e.keyCode) {
            case 37: case 39: case 38: case 40: // Arrow keys
            case 32: e.preventDefault(); break; // Space
            default: break; // do not block other keys
        }
    }, false);
    addEventListener("keyup", function (e) {
        keysDown[e.code] = false;
    }, false);

    updateVictory();
    setIntervals();
    Draw();
    audio.loop = true;
    audio.play();
}

/* A variable setting for user progress to win the game */
function updateVictory() {
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === 5 || board[i][j] === 10 || board[i][j] === 15)
                victory++;
        }
    }
}

/* Placing intervals for various actions in the game */
function setIntervals() {
    interval = setInterval(UpdatePosition, 160);
    secondInterval = setInterval(GhostsMoves, 650);
    MovingScoreInterval = setInterval(MovingScoreMove, 600);
    LivesInterval = setInterval(LivesElementMove, 2500);
    ClockScoreInterval = setInterval(ClockElementMove, 2000);
}

/* Check whether the cell is a corner in the board */
function CornerCell(row, col) {
    return ((row == 0 && col == 0) || (row == boardSize - 1 && col == 0) || (row == 0 && col == boardSize - 1) || (row == boardSize - 1 && col == boardSize - 1));
}

/* Check the integrity of the move for the ghost */
function ValidGhostMove(RowLocation, ColLocation) {
    return (RowLocation >= 0 && !CheckGhostExistInCell(RowLocation, ColLocation) && !CheckScoreElementExistInCell(RowLocation, ColLocation)
        && !CheckLiveElementExistInCell(RowLocation, ColLocation) && !CheckClockElementExistInCell(RowLocation, ColLocation));
}

/* Choose the best move for the ghost to move towards the Pacman */

function GhostsMoves() {  ///////// take
    let gameBoard = [];
    CreateBoard(gameBoard);
    /* choose current best move in the board*/
    BFS(shape.i, shape.j, gameBoard);

    for (var i = 0; i < GhostPositions.length; i++) {
        var currentGhostValue = i + 7;
        var RowLocation = GhostPositions[i][0];
        var ColLocation = GhostPositions[i][1];
        let LeftDistance;
        let DownDistance;
        let RightDistance;
        let UpDistance;

        switch (GhostPositions[i][0] > 0 && ValidGhostMove(GhostPositions[i][0] - 1, GhostPositions[i][1])) {
            case true:
                LeftDistance = gameBoard[GhostPositions[i][0] - 1][GhostPositions[i][1]];
                break;
            default:
                LeftDistance = 100;
                break;
        }

        switch (GhostPositions[i][1] > 0 && ValidGhostMove(GhostPositions[i][0], GhostPositions[i][1] - 1)) {
            case true:
                DownDistance = gameBoard[GhostPositions[i][0]][GhostPositions[i][1] - 1];
                break;
            default:
                DownDistance = 100;
                break;
        }

        switch (GhostPositions[i][0] < boardSize - 1 && ValidGhostMove(GhostPositions[i][0] + 1, GhostPositions[i][1])) {
            case true:
                RightDistance = gameBoard[GhostPositions[i][0] + 1][GhostPositions[i][1]];
                break;
            default:
                RightDistance = 100;
                break;
        }

        switch (GhostPositions[i][1] < boardSize - 1 && ValidGhostMove(GhostPositions[i][0], GhostPositions[i][1] + 1)) {
            case true:
                UpDistance = gameBoard[GhostPositions[i][0]][GhostPositions[i][1] + 1];
                break;
            default:
                UpDistance = 100;
                break;
        }

        /* choose the move with the minimal weight */
        var min = Math.min(UpDistance, DownDistance, RightDistance, LeftDistance);
        if (min < 100) {
            if (min == DownDistance) {
                if (SetGhost(RowLocation, ColLocation, RowLocation, ColLocation - 1, i, currentGhostValue)) {
                    CreateBoard(gameBoard);
                    BFS(shape.i, shape.j, gameBoard);
                }
            }
            else if (min == UpDistance) {
                if (SetGhost(RowLocation, ColLocation, RowLocation, ColLocation + 1, i, currentGhostValue)) {
                    CreateBoard(gameBoard);
                    BFS(shape.i, shape.j, gameBoard);
                }
            }
            else if (min == RightDistance) {
                if (SetGhost(RowLocation, ColLocation, RowLocation + 1, ColLocation, i, currentGhostValue)) {
                    CreateBoard(gameBoard);
                    BFS(shape.i, shape.j, gameBoard);
                }
            }
            else if (min == LeftDistance) {
                if (SetGhost(RowLocation, ColLocation, RowLocation - 1, ColLocation, i, currentGhostValue)) {
                    CreateBoard(gameBoard);
                    BFS(shape.i, shape.j, gameBoard);
                }
            }
            Draw();
        }

    }
}

/* Choosing a location for the ghost */
function SetGhost(Row, Col, NewRow, NewCol, index, currentGhostValue) {
    board[Row][Col] = GhostPositions[index][2]; /* set the prevoius value to the board */
    GhostPositions[index][0] = NewRow;
    GhostPositions[index][1] = NewCol;
    if (!PacmanCaughtByGhostMove(NewRow, NewCol)) {
        GhostPositions[index][2] = board[NewRow][NewCol];
        board[NewRow][NewCol] = currentGhostValue; /* set the ghost value to the board */
        return false;
    }
    else {
        GhostPositions[index][2] = 0;
        setGhostsAfterCatch();
    }
    return true;
}

/* Disqualifying the user when the ghost is moving towards him */
function PacmanCaughtByGhostMove(x, y) {
    /* checks if the ghost has caught the pacman */
    if (board[x][y] == 1 || board[x][y] == 2 || board[x][y] == 3 || board[x][y] == 4) {
        if (score >= 10) {
            score = score - 10;
        }
        else {
            score = 0;
        }
        clearIntervals();
        audio.pause();
        lossAudio.play();
        var startAlertTime = new Date();
        window.alert("You Lost!");
        var endAlertTime = new Date();
        lossAudio.pause();
        lossAudio = new Audio('lossSound.mp3');
        audio.play();
        waitingTime += (endAlertTime - startAlertTime) / 1000;
        NumOfFouls--;
        /* A case in which the pacman has no lifes left */
        if (NumOfFouls == 0) {
            EndGame();
        }
        else {/* A case in which the pacman has at least one life left */
            setIntervals();
            var emptyCell = findRandomEmptyCell(board);
            board[shape.i][shape.j] = 0; /* removes the Pacman from his cell */
            while (checkGohstInCorner(emptyCell[0], emptyCell[1])) {
                emptyCell = findRandomEmptyCell(board);
            }
            shape.i = emptyCell[0];
            shape.j = emptyCell[1];
            board[emptyCell[0]][emptyCell[1]] = 4;
        }
        ResetKeys();
        return true;
    }
    return false;
}

/* Disqualifying the user when the pacman is moving towards the ghost */
function PacmanCaughtByPacmanMove(x, y) {
    /* checks if the pacman moved to ghost's cell */
    if (board[x][y] == 7 || board[x][y] == 8 || board[x][y] == 9) {
        if (score > 10) {
            score = score - 10;
        }
        else {
            score = 0;
        }
        clearIntervals();
        audio.pause();
        lossAudio.play();
        var startAlertTime = new Date();
        window.alert("You Lost!");
        var endAlertTime = new Date();
        lossAudio.pause();
        lossAudio = new Audio('lossSound.mp3');
        audio.play();
        waitingTime += (endAlertTime - startAlertTime) / 1000;
        NumOfFouls--;
        if (NumOfFouls == 0) {
            EndGame();
        }
        else {
            setIntervals();
            var emptyCell = findRandomEmptyCell(board);
            board[shape.i][shape.j] = 0; //* remove the Pacman from his cell */
            while (checkGohstInCorner(emptyCell[0], emptyCell[1])) {
                emptyCell = findRandomEmptyCell(board);
            }
            shape.i = emptyCell[0];
            shape.j = emptyCell[1];
            board[emptyCell[0]][emptyCell[1]] = 4;
            setGhostsAfterCatch();
        }
        ResetKeys();
        return true;
    }
    return false;
}

/* Handling end of the game */
function EndGame() {
    clearIntervals();
    audio.pause();
    if (victory !== 0) {
        gameOverAudio.play();
        setTimeout(function () { gameOverAudio.pause(); }, 4000);
    }
    else {
        winnerAudio.play();
        setTimeout(function () { winnerAudio.pause(); }, 3000);
    }
    HomeWindow();
}

/* Checks whether the time of the game is passed or not*/
function TimePassed() {
    var currentTime = new Date();
    time_elapsed = ((currentTime - start_time) / 1000) - waitingTime;
    return time_elapsed >= GameTime;
}

/* Checks whether a ghost is in a current cell */
function CheckGhostExistInCell(x, y) {
    return board[x][y] == 7 || board[x][y] == 8 || board[x][y] == 9;
}

/* Checks whether a wall is in a current cell */
function CheckWallExistInCell(x, y) {
    return board[x][y] == 6;
}

/* Checks whether a score element is in a current cell */
function CheckScoreElementExistInCell(x, y) {
    return board[x][y] == 11;
}

/* Checks whether a life is in a current cell */
function CheckLiveElementExistInCell(x, y) {
    return board[x][y] == 12;
}

/* Checks whether a clock element is in a current cell */
function CheckClockElementExistInCell(x, y) {
    return board[x][y] == 13;
}

/* Checks whether a pacman is in a current cell */
function CheckPacmanExistInCell(x, y) {
    return board[x][y] == 1 || board[x][y] == 2 || board[x][y] == 3 || board[x][y] == 4;
}

/* Finds empty cell in the board */
function findRandomEmptyCell(board) {
    let i = getRandNum();
    let j = getRandNum();
    while (board[i][j] !== 0) {
        i = getRandNum();
        j = getRandNum();
    }
    return [i, j];
}

/* Finds a random number up to the size of the board */
function getRandNum() {
    return Math.floor((Math.random() * (boardSize - 1)) + 1);
}

/* Get a numeric value for pressing the keyboard buttons */
function GetKeyPressed() {
    if (keysDown['ArrowUp'] || keysDown[upKey]) {
        return 1;
    }
    if (keysDown['ArrowDown'] || keysDown[downKey]) {
        return 2;
    }
    if (keysDown['ArrowLeft'] || keysDown[leftKey]) {
        return 3;
    }
    if (keysDown['ArrowRight'] || keysDown[rightKey]) {
        return 4;
    }
}

/* Reset previous click values ​​for keyboard buttons */
function ResetKeys() {
    keysDown['ArrowUp'] = false;
    keysDown[upKey] = false;
    keysDown['ArrowDown'] = false;
    keysDown[downKey] = false;
    keysDown['ArrowLeft'] = false;
    keysDown[leftKey] = false;
    keysDown['ArrowRight'] = false;
    keysDown[rightKey] = false;
}

/* Select new game keys by the user */
function uniKeyCode(event, id) {
    var key = event.code;
    switch (id) {
        case "upArrow":
            upKey = key;
            break;
        case "downArrow":
            downKey = key;
            break;
        case "leftArrow":
            leftKey = key;
            break;
        case "rightArrow":
            rightKey = key;
            break;
    }
}

/* Drawing the game board and the characters on the screen */
function Draw() {
    context.clearRect(0, 0, canvas.width, canvas.height); //clean board
    lblScore.value = score;
    lblTime.value = time_elapsed;
    lblLives.value = NumOfFouls;
    for (var i = 0; i < boardSize; i++) {
        for (var j = 0; j < boardSize; j++) {
            var center = new Object();
            center.x = i * 46 + 23;
            center.y = j * 46 + 23;
            if (board[i][j] == 1) { /* draw pacman up */
                context.drawImage(pacman_up, i * 46, j * 46, 46, 46);
            }
            else if (board[i][j] == 2) { /* draw pacman down */
                context.drawImage(pacman_down, i * 46, j * 46, 46, 46);
            }
            else if (board[i][j] == 3) { /* draw pacman left */
                context.drawImage(pacman_left, i * 46, j * 46, 46, 46);
            }
            else if (board[i][j] == 4) { /* draw pacman right */
                context.drawImage(pacman_right, i * 46, j * 46, 46, 46);
            }
            else if (board[i][j] == 5) { /* draw 5 point ball */
                context.beginPath();
                context.arc(center.x, center.y, 15, 0, 2 * Math.PI); /* circle */
                context.fillStyle = ColorOf5pts; /* color */
                context.fill();
            }
            else if (board[i][j] == 10) { /* draw 15 point ball */
                context.beginPath();
                context.arc(center.x, center.y, 15, 0, 2 * Math.PI); /* circle */
                context.fillStyle = ColorOf10pts; /* color */
                context.fill();
            }
            else if (board[i][j] == 15) { /* draw 25 point ball */
                context.beginPath();
                context.arc(center.x, center.y, 15, 0, 2 * Math.PI); /* circle */
                context.fillStyle = ColorOf15pts; /* color */
                context.fill();
            }
            else if (board[i][j] == 6) { /* draw wall */
                context.drawImage(WallImage, i * 46, j * 46, 46, 46);
            }
            else if (board[i][j] == 7) { /* draw ghost 1 */
                context.drawImage(ghost1, i * 46, j * 46, 46, 46);
            }
            else if (board[i][j] == 8) {  /* draw ghost 2 */
                context.drawImage(ghost2, i * 46, j * 46, 46, 46);
            }
            else if (board[i][j] == 9) {  /* draw ghost 3 */
                context.drawImage(ghost3, i * 46, j * 46, 46, 46);
            }
            else if (board[i][j] == 11) {  /* draw moving score element */
                context.drawImage(MovingScore, i * 46, j * 46, 46, 46);
            }
            else if (board[i][j] == 12) { /* draw life */
                context.drawImage(Lives, i * 46, j * 46, 46, 46);
            }
            else if (board[i][j] == 13) {  /* draw clock */
                context.drawImage(Clock, i * 46, j * 46, 46, 46);
            }

        }
    }
}

/* Update locations of all game characters on the board */
function UpdatePosition() {
    if (TimePassed()) {
        if (score < 150) {
            clearIntervals();
            audio.pause();
            window.alert("You can do better! Your score is: " + score);
        }
        else {
            clearIntervals();
            audio.pause();
            window.alert("We have a Winner!!!");
            victory = 0;
        }
        EndGame();
        return;
    }
    let prevVal = board[shape.i][shape.j];
    let changed = false;
    board[shape.i][shape.j] = 0;
    var x = GetKeyPressed();
    if (x === 1) { /* A case in which the user chose to move up */
        if (shape.j > 0 && board[shape.i][shape.j - 1] !== 6 && (!PacmanCaughtByPacmanMove(shape.i, shape.j - 1))) {
            shape.j--;
            UpdateScore();
            board[shape.i][shape.j] = 1;
            changed = true;
        }
    }
    else if (x === 2) { /* A case in which the user chose to move down */
        if (shape.j < boardSize - 1 && board[shape.i][shape.j + 1] !== 6 && (!PacmanCaughtByPacmanMove(shape.i, shape.j + 1))) {
            shape.j++;
            UpdateScore();
            board[shape.i][shape.j] = 2;
            changed = true;
        }
    }
    else if (x === 3) { /* A case in which the user chose to move left */
        if (shape.i > 0 && board[shape.i - 1][shape.j] !== 6 && (!PacmanCaughtByPacmanMove(shape.i - 1, shape.j))) {
            shape.i--;
            UpdateScore();
            board[shape.i][shape.j] = 3;
            changed = true;
        }
    }
    else if (x === 4) { /* A case in which the user chose to move right */
        if (shape.i < boardSize - 1 && board[shape.i + 1][shape.j] !== 6 && (!PacmanCaughtByPacmanMove(shape.i + 1, shape.j))) {
            shape.i++;
            UpdateScore();
            board[shape.i][shape.j] = 4;
            changed = true;
        }
    }
    if (!changed) {
        board[shape.i][shape.j] = prevVal;
    }
    Draw();
    if (victory === 0) {
        setWinner();
    }
}

/* A case in which the Pacman took all the balls in the board */
function setWinner() {
    Draw();
    audio.pause();
    window.alert("You are the Winner!!!");
    EndGame();
}

/* Updating the user's amount of points */
function UpdateScore() {
    if (board[shape.i][shape.j] === 5) { /* A case in which the pecman is in a cell with a 5-point ball */
        score += 5;
        victory--;
    }
    else if (board[shape.i][shape.j] === 10) { /* A case in which the pecman is in a cell with a 15-point ball */
        score += 15;
        victory--;
    }
    else if (board[shape.i][shape.j] === 15) { /* A case in which the pecman is in a cell with a 25-point ball */
        score += 25;
        victory--;
    }
    else if (board[shape.i][shape.j] === 11) { /* A case in which the pecman is in a cell with a moving score element  */
        score = score + 50;
        var emptyCell = findRandomEmptyCell(board);
        if (ScorePositions[0][2] == 5 || ScorePositions[0][2] == 10 || ScorePositions[0][2] == 15) {
            victory--;
        }
        board[ScorePositions[0][0]][ScorePositions[0][1]] = ScorePositions[0][2];
        ScorePositions[0][0] = emptyCell[0];
        ScorePositions[0][1] = emptyCell[1];
        ScorePositions[0][2] = board[ScorePositions[0][0]][ScorePositions[0][1]];
        board[emptyCell[0]][emptyCell[1]] = 11;
    }
    else if (board[shape.i][shape.j] === 12) { /* A case in which the pecman is in a cell with a life */
        NumOfFouls++;
        var emptyCell = findRandomEmptyCell(board);
        board[ScorePositions[1][0]][ScorePositions[1][1]] = 0;
        ScorePositions[1][0] = emptyCell[0];
        ScorePositions[1][1] = emptyCell[1];
        ScorePositions[1][2] = 0;
        board[emptyCell[0]][emptyCell[1]] = 12;
    }
    else if (board[shape.i][shape.j] === 13) { /* A case in which the pecman is in a cell with a clock */
        currentTime = new Date();
        if ((((currentTime - start_time) / 1000) - waitingTime) < 15) {
            start_time = currentTime;
            waitingTime = 0;
        }
        else {
            start_time.setSeconds(start_time.getSeconds() + 15);
            waitingTime <= 15 ? waitingTime = 0 : waitingTime -= 15;
        }
        var emptyCell = findRandomEmptyCell(board);
        board[ScorePositions[2][0]][ScorePositions[2][1]] = 0;
        ScorePositions[2][0] = emptyCell[0];
        ScorePositions[2][1] = emptyCell[1];
        ScorePositions[2][2] = 0;
        board[emptyCell[0]][emptyCell[1]] = 13;
    }
}

/* The movement of the cup figure */
function MovingScoreMove() {
    var RandMove;
    var ScoreRow = ScorePositions[0][0];
    var ScoreCol = ScorePositions[0][1];
    var MoveDone = false;
    var iterations = 10;
    while ((!MoveDone) && iterations > 0) {
        RandMove = Math.floor(Math.random() * 4);
        if (RandMove == 0 && ValidLocation(ScoreRow - 1, ScoreCol) && !CheckWallExistInCell(ScoreRow - 1, ScoreCol)
            && !CheckGhostExistInCell(ScoreRow - 1, ScoreCol) && !CheckLiveElementExistInCell(ScoreRow - 1, ScoreCol)
            && !CheckClockElementExistInCell(ScoreRow - 1, ScoreCol) && !CheckPacmanExistInCell(ScoreRow - 1, ScoreCol)
            && !checkGohstInCorner(ScoreRow - 1, ScoreCol)) { /* move up */
            board[ScoreRow][ScoreCol] = ScorePositions[0][2];
            ScorePositions[0][0] = ScoreRow - 1;
            ScorePositions[0][1] = ScoreCol;
            ScorePositions[0][2] = board[ScoreRow - 1][ScoreCol];
            board[ScoreRow - 1][ScoreCol] = 11;
            MoveDone = true;
            iterations = 0;
        }
        else if (RandMove == 1 && ValidLocation(ScoreRow + 1, ScoreCol) && !CheckWallExistInCell(ScoreRow + 1, ScoreCol)
            && !CheckGhostExistInCell(ScoreRow + 1, ScoreCol) && !CheckLiveElementExistInCell(ScoreRow + 1, ScoreCol)
            && !CheckClockElementExistInCell(ScoreRow + 1, ScoreCol) && !CheckPacmanExistInCell(ScoreRow + 1, ScoreCol)
            && !checkGohstInCorner(ScoreRow + 1, ScoreCol)) {/* move down */
            board[ScoreRow][ScoreCol] = ScorePositions[0][2];
            ScorePositions[0][0] = ScoreRow + 1;
            ScorePositions[0][1] = ScoreCol;
            ScorePositions[0][2] = board[ScoreRow + 1][ScoreCol];
            board[ScoreRow + 1][ScoreCol] = 11;
            MoveDone = true;
            iterations = 0;
        }
        else if (RandMove == 2 && ValidLocation(ScoreRow, ScoreCol - 1) && !CheckWallExistInCell(ScoreRow, ScoreCol - 1)
            && !CheckGhostExistInCell(ScoreRow, ScoreCol - 1) && !CheckLiveElementExistInCell(ScoreRow, ScoreCol - 1)
            && !CheckClockElementExistInCell(ScoreRow, ScoreCol - 1) && !CheckPacmanExistInCell(ScoreRow, ScoreCol - 1)
            && !checkGohstInCorner(ScoreRow, ScoreCol - 1)) {/* move left */
            board[ScoreRow][ScoreCol] = ScorePositions[0][2];
            ScorePositions[0][0] = ScoreRow;
            ScorePositions[0][1] = ScoreCol - 1;
            ScorePositions[0][2] = board[ScoreRow][ScoreCol - 1];
            board[ScoreRow][ScoreCol - 1] = 11;
            MoveDone = true;
            iterations = 0;
        }
        else if (RandMove == 3 && ValidLocation(ScoreRow, ScoreCol + 1) && !CheckWallExistInCell(ScoreRow, ScoreCol + 1)
            && !CheckGhostExistInCell(ScoreRow, ScoreCol + 1) && !CheckLiveElementExistInCell(ScoreRow, ScoreCol + 1)
            && !CheckClockElementExistInCell(ScoreRow, ScoreCol + 1) && !CheckPacmanExistInCell(ScoreRow, ScoreCol + 1)
            && !checkGohstInCorner(ScoreRow, ScoreCol + 1)) {/* move right */
            board[ScoreRow][ScoreCol] = ScorePositions[0][2];
            ScorePositions[0][0] = ScoreRow;
            ScorePositions[0][1] = ScoreCol + 1;
            ScorePositions[0][2] = board[ScoreRow][ScoreCol + 1];
            board[ScoreRow][ScoreCol + 1] = 11;
            MoveDone = true;
            iterations = 0;
        }
        iterations--;
    }
    Draw();
}

/* Checks whether a current cell is a valid location in the board */
function ValidLocation(Row, Col) {
    return Row >= 0 && Row <= boardSize - 1 && Col >= 0 && Col <= boardSize - 1;
}

/* The movement of the life figure */
function LivesElementMove() {
    var emptyCell = findRandomEmptyCell(board);
    while (checkGohstInCorner(emptyCell[0], emptyCell[1])) {
        emptyCell = findRandomEmptyCell(board);
    }
    board[emptyCell[0]][emptyCell[1]] = 12;
    board[ScorePositions[1][0]][ScorePositions[1][1]] = ScorePositions[1][2];
    ScorePositions[1][0] = emptyCell[0];
    ScorePositions[1][1] = emptyCell[1];
    ScorePositions[1][2] = 0;
    Draw();
}

/* The movement of the clock figure */
function ClockElementMove() {
    var emptyCell = findRandomEmptyCell(board);
    while (checkGohstInCorner(emptyCell[0], emptyCell[1])) {
        emptyCell = findRandomEmptyCell(board);
    }
    board[emptyCell[0]][emptyCell[1]] = 13;
    board[ScorePositions[2][0]][ScorePositions[2][1]] = ScorePositions[2][2];
    ScorePositions[2][0] = emptyCell[0];
    ScorePositions[2][1] = emptyCell[1];
    ScorePositions[2][2] = 0;
    Draw();
}

/* First initialization of game characters and accompanying parameters */
function initialProperties() {
    UsersTable = new Array();
    UsersTable.push({ username: "a", password: "a", name: "a" }); /* Adds user by default */

    boardSize = 12;
    ghost1 = new Image();
    ghost1.src = 'ghost_1.png';
    ghost2 = new Image();
    ghost2.src = 'ghost_2.png';
    ghost3 = new Image();
    ghost3.src = 'ghost_3.png';

    pacman_right = new Image();
    pacman_right.src = '‏‏pacman4.png';
    pacman_left = new Image();
    pacman_left.src = '‏‏pacman3.png';
    pacman_up = new Image();
    pacman_up.src = '‏‏pacman1.png';
    pacman_down = new Image();
    pacman_down.src = '‏‏pacman2.png';
    MovingScore = new Image();
    MovingScore.src = 'MovingScore.png';

    Lives = new Image();
    Lives.src = 'lives.png';
    Clock = new Image();
    Clock.src = 'Clock.png';
    WallImage = new Image();
    WallImage.src = 'wall.png';
}

/* Reset the board variables when running a new game */
function ResetProperties() {
    board = new Array();
    GhostPositions = new Array();
    GhostPositions.push([0, 0, 0]);
    ScorePositions = new Array();
    ScorePositions.push([0, boardSize - 1, 0]);
    victory = 0;
    NumOfFouls = 3;
    audio = new Audio('sound.mp3');
    gameOverAudio = new Audio('gameOver.mp3');
    winnerAudio = new Audio('winnerSound.mp3');
    lossAudio = new Audio('lossSound.mp3');
}

/* Running a new game */
function NewGame() {
    audio.pause();
    ResetProperties();
    ScreenDisplay(true, true, true, true, false, true, true);
    clearIntervals();
}

/* Checks whether the username exists in the system */
function UserExists(SignIpUsername) {
    for (var i = 0; i < UsersTable.length; i++) {
        if (UsersTable[i].username == SignIpUsername) {
            return true;
        }
    }
    return false;
}

/* Checks whether the password is compatible to the username */
function ValidLoginUser(LoginUsername, LoginPassword) {
    for (var i = 0; i < UsersTable.length; i++) {
        if (UsersTable[i].username == LoginUsername) {
            if (UsersTable[i].password == LoginPassword) {
                return true;
            }
            else {
                return false
            }
        }
    }
    return false;
}

/* Displays the parts of the page according to the current state */
function ScreenDisplay(welcomeT, signUpT, loginT, gameT, gameOpT, mainT, contactT) {
    WelcomeWindow = document.getElementById("WelcomeWindow").hidden = welcomeT;
    SignUpWindow = document.getElementById("SignUpWindow").hidden = signUpT;
    LoginWindow = document.getElementById("LoginWindow").hidden = loginT;
    GameWindow = document.getElementById("Game").hidden = gameT;
    GameOptionsWindow = document.getElementById("GameOptions").hidden = gameOpT;
    MainWindow = document.getElementById("MainWindow").hidden = mainT;
    ContactWindow = document.getElementById("ContactWindow").hidden = contactT;
}

/* Stops audio on background */
function PauseBackgroundAudio(){
    if (audio !== null & audio !== undefined){
        audio.pause();
    }
}

/* Opening a login window */
function LoginShowWindow() {
    PauseBackgroundAudio();
    ExitModalWindow();
    clearIntervals();
    ScreenDisplay(true, true, false, true, true, true, true);
    document.getElementById("LoginUsername").value = "";
    document.getElementById("LoginPassword").value = "";
}

/* Opening a signup window */
function SignUpShowWindow() {
    PauseBackgroundAudio();
    ExitModalWindow();
    clearIntervals();
    ScreenDisplay(true, false, true, true, true, true, true);
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("firstname").value = "";
    document.getElementById("lastname").value = "";
    document.getElementById("Email").value = "";
    document.getElementById("date").value = "";
}

/* Opening an about modal window */
function AboutShowWindow() {
    PauseBackgroundAudio();
    ExitModalWindow();
    clearIntervals();
    ScreenDisplay(true, true, true, true, true, true, true);
    document.getElementById('AboutWindow').style.display = 'block';
}

/* Opening a contact window */
function ContactShowWindow() {
    PauseBackgroundAudio();
    ExitModalWindow();
    clearIntervals();
    ScreenDisplay(true, true, true, true, true, true, false);
}

/* Closing an about modal window */
function ExitModalWindow() {
    document.getElementById('AboutWindow').style.display = 'none';
    MainWindow = document.getElementById("MainWindow").hidden = false;
}

/* Opening a home window */
function HomeWindow() {
    PauseBackgroundAudio();
    ExitModalWindow();
    clearIntervals();
    ScreenDisplay(true, true, true, true, true, false, true);
}

/* Removes all intervals */
function clearIntervals() {
    window.clearInterval(interval);
    window.clearInterval(secondInterval);
    window.clearInterval(MovingScoreInterval);
    window.clearInterval(LivesInterval);
    window.clearInterval(ClockScoreInterval);
}

/* Handling login process */
function Login() {
    var username = document.getElementById("LoginUsername").value;
    var password = document.getElementById("LoginPassword").value;
    if (!UserExists(username)) {
        window.alert("User name does not exist in the system");
    }
    else if (!ValidLoginUser(username, password)) {
        window.alert("Password is not compatible with the user name, please change it");
    }
    else {
        userInSystem = UsersTable.map(function (e) {
            if (e.username === username)
                return e["name"];
        });
        window.alert("You have successfully signed in");
        ScreenDisplay(true, true, true, true, false, true, true);
    }
}

/* Checking given input in a given range */
function validInput(input, minVal, maxVal, message) {
    if (input === undefined || input === "" || input < minVal || input > maxVal) {
        window.alert("Please insert a valid " + message + "!");
        return false;
    }
    return true;
}

/* Select settings for the game board */
function SetOptionToGame() {
    BallsNumber = document.getElementById("BallsNumber").value;
    if (!validInput(BallsNumber, 50, 90, "number of balls"))
        return;
    numOf5pts = Math.round(BallsNumber * 0.6);
    numOf10pts = Math.round(BallsNumber * 0.3);
    numOf15pts = BallsNumber - numOf5pts - numOf10pts;
    GameTime = document.getElementById("GameTime").value;
    if (!validInput(GameTime, 60, Number.MAX_SAFE_INTEGER, "game time"))
        return;
    GhostNum = document.getElementById("GHNum").value;
    if (!validInput(GhostNum, 1, 3, "number of ghosts"))
        return;
    ColorOf5pts = document.getElementById("5ptsBall").value;
    ColorOf10pts = document.getElementById("10ptsBall").value;
    ColorOf15pts = document.getElementById("15ptsBall").value;

    StartGame();
    Start();
}

/* Get Random number in a given range */
function GetRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* Get Random color */
function GetRndColor() {
    return '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
}

/* Get random game options */
function RandomOption() {
    $("#BallsNumber").val(GetRndInteger(50, 90).toString());
    $("#5ptsBall").val(GetRndColor());
    $("#10ptsBall").val(GetRndColor());
    $("#15ptsBall").val(GetRndColor());
    $("#GameTime").val(GetRndInteger(60, 180).toString());
    $("#GHNum").val(GetRndInteger(1, 3).toString());
}

/* Displays the beginning of a new game */
function StartGame() {
    ScreenDisplay(true, true, true, false, true, true, true);
}

/* Displays the home page */
function Back() {
    ScreenDisplay(false, true, true, true, true, false, true);
}

/* Set a temporary board for running BFS algorithm */
function CreateBoard(gameBoard) {
    const size = 12;
    for (let x = 0; x < size; x++) {
        gameBoard[x] = [];
        for (let y = 0; y < size; y++) {
            switch (board[x][y]) {
                case 0:  // empty cell
                    gameBoard[x][y] = -1;
                    break;
                case 5:  // 5 points cell
                    gameBoard[x][y] = -1;
                    break;
                case 10:  // 15 points cell
                    gameBoard[x][y] = -1;
                    break;
                case 15:  // 25 points cell
                    gameBoard[x][y] = -1;
                    break;
                default: // other
                    gameBoard[x][y] = 100;
                    break;
            }
        }
    }
}

/* BFS algorithm to find the best step for the ghost */
function BFS(x, y, gameBoard) {

    gameBoard[x][y] = 0;
    let queue = new Array();
    let obj = {
        i: x,
        j: y
    };
    queue.push(obj);

    while (queue.length != 0) {
        let currElem = queue.shift();

        if (ValidLocation(currElem.i, currElem.j + 1) && gameBoard[currElem.i][currElem.j + 1] == -1) {
            gameBoard[currElem.i][currElem.j + 1] = gameBoard[currElem.i][currElem.j] + 1;
            queue.push({
                i: currElem.i,
                j: currElem.j + 1
            });
        }
        if (ValidLocation(currElem.i, currElem.j - 1) && gameBoard[currElem.i][currElem.j - 1] == -1) {
            gameBoard[currElem.i][currElem.j - 1] = gameBoard[currElem.i][currElem.j] + 1;
            queue.push({
                i: currElem.i,
                j: currElem.j - 1
            });
        }
        if (ValidLocation(currElem.i - 1, currElem.j) && gameBoard[currElem.i - 1][currElem.j] == -1) {
            gameBoard[currElem.i - 1][currElem.j] = gameBoard[currElem.i][currElem.j] + 1;
            queue.push({
                i: currElem.i - 1,
                j: currElem.j
            });
        }
        if (ValidLocation(currElem.i + 1, currElem.j) && gameBoard[currElem.i + 1][currElem.j] == -1) {
            gameBoard[currElem.i + 1][currElem.j] = gameBoard[currElem.i][currElem.j] + 1;
            queue.push({
                i: currElem.i + 1,
                j: currElem.j
            });
        }
    }
}

/* Checks whether in given coordinates should be a ghost*/
function checkGohstInCorner(x, y) {
    return ((x === 0 && y === 0) || (x === boardSize - 1 && y === boardSize - 1) || (x === boardSize - 1 && y === 0));
}

/* Reset all ghosts to corner cells*/
function setGhostsAfterCatch() {
    for (var i = 0; i < GhostPositions.length; i++) {
        board[GhostPositions[i][0]][GhostPositions[i][1]] = GhostPositions[i][2];
    }
    board[0][0] = 7;
    GhostPositions = new Array();
    GhostPositions.push([0, 0, 0]);
    if (GhostNum > 1) {
        board[boardSize - 1][boardSize - 1] = 8;
        GhostPositions.push([boardSize - 1, boardSize - 1, 0]);
        if (GhostNum > 2) {
            board[boardSize - 1][0] = 9;
            GhostPositions.push([boardSize - 1, 0, 0]);
        }
    }
}

/* Handling closing about modal window by esc button */
$(document).keydown(function (event) {
    if (event.keyCode == 27) {
        $('#AboutWindow').hide();
        Back();
        audio.pause();
    }
});

/* Handling closing about modal window by clicking the button */
window.onclick = function (event) {
    if (event.target == document.getElementById('AboutWindow')) {
        document.getElementById('AboutWindow').style.display = "none";
        MainWindow = document.getElementById("MainWindow").hidden = false;
    }
}