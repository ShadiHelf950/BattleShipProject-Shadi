document.addEventListener('DOMContentLoaded', () => {

    /************************ User Identifiers ***************************/

    const userGrid = document.querySelector('.grid-user')

    const userSquares = []

    /************************ Opponent Identifiers ***************************/

    const computerGrid = document.querySelector('.grid-computer')

    const computerSquares = []

    /*******************************************************************/

    const displayGrid = document.querySelector('.grid-display')
    const ships = document.querySelectorAll('.ship')

    const destroyer = document.querySelector('.destroyer-container')
    const submarine = document.querySelector('.submarine-container')
    const cruiser = document.querySelector('.cruiser-container')
    const battleship = document.querySelector('.battleship-container')
    const carrier = document.querySelector('.carrier-container')

    const startButton = document.querySelector('#start')
    const rotateButton = document.querySelector('#rotate')
    const turnDisplay = document.querySelector('#whose-go')
    const infoDisplay = document.querySelector('#info')

    //gameResultInput = document.querySelector('#gameResultID')

    var difficulty = 'Normal' // Valid difficulty

    var takenCount = 0 // Check if all the users ships are place on the board

    var firstTurnCheck = true // Check if we are at the first turn

    /* User Results Variables */

    var destroyerCount = 0

    var submarineCount = 0

    var cruiserCount = 0

    var battleshipCount = 0

    var carrierCount = 0

    var sunkPlayerDestroyer = false

    var sunkPlayerSubmarine = false

    var sunkPlayerCruiser = false

    var sunkPlayerBattleship = false

    var sunkPlayerCarrier = false

    /* Computer Results Variables */

    var cpuDestroyerCount = 0

    var cpuSubmarineCount = 0

    var cpuCruiserCount = 0

    var cpuBattleshipCount = 0

    var cpuCarrierCount = 0

    var sunkComputerCarrier = false

    var sunkComputerBattleship = false

    var sunkComputerCruiser = false

    var sunkComputerDestroyer = false

    var sunkComputerSubmarine = false

    const width = 10 // Board dimensions

    /***********************************************************/

    // Ships directions placement array

    const shipArray =
        [
            { name: 'destroyer', directions: [[0, 1], [0, width]] }, // Multiplications of 10

            { name: 'submarine', directions: [[0, 1, 2], [0, width, 2 * width]] }, // Multiplications of 10

            { name: 'cruiser', directions: [[0, 1, 2], [0, width, 2 * width]] }, // Multiplications of 10

            { name: 'battleship', directions: [[0, 1, 2, 3], [0, width, 2 * width, 3 * width]] }, // Multiplications of 10

            { name: 'carrier', directions: [[0, 1, 2, 3, 4], [0, width, 2 * width, 3 * width, 4 * width]] } // Multiplications of 10   
        ]

    /***********************************************************/

    let isHorizontal = true // Horinzontal direction
    let isGameOver = false
    let currentPlayer = 'user'
    let playerNum = 0
    let ready = false
    let enemyReady = false
    let allShipsPlaced = false
    let shotFired = -1

    createBoard(userGrid, userSquares, width) // create user game board
    createBoard(computerGrid, computerSquares, width) // create computer game board

    if (gameMode === 'singlePlayer') {

        document.getElementById("difficulty").onchange = function () {

            difficulty = document.getElementById("difficulty").value
        };

        startSinglePlayer()
    }
    else {
        startMultiPlayer()
    }

    function post(path, params, method = 'post') {

        // The rest of this code assumes you are not using a library.
        // It can be made less verbose if you use one.
        const form = document.createElement('form');
        form.method = method;
        form.action = path;

        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                const hiddenField = document.createElement('input');
                hiddenField.type = 'hidden';
                hiddenField.name = key;
                hiddenField.value = params[key];

                form.appendChild(hiddenField);
            }
        }

        document.body.appendChild(form);
        form.submit();
    }

    // Multiplayer
    function startMultiPlayer()
    {
        const socket = io();

        // Get your player number
        socket.on('player-number', num => {
            if (num === -1) {
                infoDisplay.innerHTML = "Sorry, the server is full"
            } else {
                playerNum = parseInt(num)
                if (playerNum === 1) currentPlayer = "enemy"

                console.log(playerNum)

                // Get other player status
                socket.emit('check-players')
            }
        })

        // Another player has connected or disconnected
        socket.on('player-connection', num => {
            console.log(`Player number ${num} has connected or disconnected`)
            playerConnectedOrDisconnected(num)
        })

        // On enemy ready
        socket.on('enemy-ready', num => {
            enemyReady = true
            playerReady(num)
            if (ready) playGameMulti(socket)
        })

        // Check player status
        socket.on('check-players', players => {
            players.forEach((p, i) => {
                if (p.connected) playerConnectedOrDisconnected(i)
                if (p.ready) {
                    playerReady(i)
                    if (i !== playerReady) enemyReady = true
                }
            })
        })

        // On Timeout
        socket.on('timeout', () => {
            infoDisplay.innerHTML = 'You have reached the 10 minute limit'
        })

        // Ready button click
        startButton.addEventListener('click', () => {
            if (allShipsPlaced) playGameMulti(socket)
            else infoDisplay.innerHTML = "Please place all ships below"
        })

        // Setup event listeners for firing
        computerSquares.forEach(square => {
            square.addEventListener('click', () => {
                if (currentPlayer === 'user' && ready && enemyReady) {
                    shotFired = square.dataset.id
                    socket.emit('fire', shotFired)
                }
            })
        })

        // On Fire Received
        socket.on('fire', id => {
            enemyGo(id)
            const square = userSquares[id]
            socket.emit('fire-reply', square.classList)
            playGameMulti(socket)
        })

        // On Fire Reply Received
        socket.on('fire-reply', classList => {
            revealSquare(classList)
            playGameMulti(socket)
        })

        function playerConnectedOrDisconnected(num) {
            let player = `.p${parseInt(num) + 1}`
            document.querySelector(`${player} .connected`).classList.toggle('active')
            if (parseInt(num) === playerNum) document.querySelector(player).style.fontWeight = 'bold'
        }
    }

    // Single Player
    function startSinglePlayer()
    {
        // Generate random ships for the computer

        generate(shipArray[0]) // destroyer
        generate(shipArray[1]) // submarine
        generate(shipArray[2]) // cruiser
        generate(shipArray[3]) // battleship
        generate(shipArray[4]) // carrier

        startButton.addEventListener('click', playGameSingle)
    }

    // Create user and computer boards
    function createBoard(grid, squares, width)
    {
        for (let i = 0; i < width * width; i++) // We have a 10x10 board so overall we have 100 places on the board
        {
            const square = document.createElement('div') // create a new board place

            square.dataset.id = i // Add an id identifier to the created board place

            grid.appendChild(square) // Add the div of the new board place to the input board

            squares.push(square) // Add the created place to the input board places array
        }
    }

    function generate(ship) // Generate 1 random opponent ship
    {
        var randomDirection = Math.floor(Math.random() * ship.directions.length) // Generate random direction index for ship placement
        var current = ship.directions[randomDirection] // Get random direction for ship placement

        // Determine direction based on the random ship direction index which was generated
        if (randomDirection === 0) direction = 1 // Horizontal direction
        if (randomDirection === 1) direction = width // Vertical direction

        // Random start position for the ship
        var randomStart = Math.abs(Math.floor(Math.random() * computerSquares.length - (ship.directions[0].length * direction)))

        var isTaken = current.some(i => computerSquares[randomStart + i].classList.contains('taken')) // Random place is taken 
        var isAtRightEdge = current.some(i => (randomStart + i) % width === width - 1) // Edge case for right column place
        var isAtLeftEdge = current.some(i => (randomStart + i) % width === 0) // Edge case for left column place

        // If all of the above is false then generate the ship at the random location 
        if (!isTaken && !isAtRightEdge && !isAtLeftEdge) current.forEach(i => computerSquares[randomStart + i].classList.add('taken', 'hidden', ship.name))
            
        else generate(ship) // Restart the process
    }

    // Rotate the ships
    function rotate()
    {
        if (isHorizontal) // If ships are horizontal then rotate them to be vertical
        {
            destroyer.classList.toggle('destroyer-container',false)
            submarine.classList.toggle('submarine-container', false)
            cruiser.classList.toggle('cruiser-container')
            battleship.classList.toggle('battleship-container', false)
            carrier.classList.toggle('carrier-container', false)
    
            destroyer.classList.toggle('destroyer-container-vertical',true)
            submarine.classList.toggle('submarine-container-vertical', true)
            cruiser.classList.toggle('cruiser-container-vertical', true)
            battleship.classList.toggle('battleship-container-vertical', true)
            carrier.classList.toggle('carrier-container-vertical', true)

            isHorizontal = false

            //console.log(isHorizontal)

            return
        }

        else if (!isHorizontal)   // If ships are vertical then rotate them to be horizontal
        {
            destroyer.classList.toggle('destroyer-container-vertical', false)
            submarine.classList.toggle('submarine-container-vertical', false)
            cruiser.classList.toggle('cruiser-container-vertical', false)
            battleship.classList.toggle('battleship-container-vertical', false)
            carrier.classList.toggle('carrier-container-vertical', false)

            destroyer.classList.toggle('destroyer-container', true)
            submarine.classList.toggle('submarine-container', true)
            cruiser.classList.toggle('cruiser-container', true)
            battleship.classList.toggle('battleship-container', true)
            carrier.classList.toggle('carrier-container', true)

            isHorizontal = true

            //console.log(isHorizontal)

            return
        }
    }

    rotateButton.addEventListener('click', rotate) // Rotate user ships

    // Enable dragging for user ships
    ships.forEach(ship => ship.addEventListener('dragstart', dragStart))
    userSquares.forEach(square => square.addEventListener('dragstart', dragStart))
    userSquares.forEach(square => square.addEventListener('dragover', dragOver))
    userSquares.forEach(square => square.addEventListener('dragenter', dragEnter))
    userSquares.forEach(square => square.addEventListener('dragleave', dragLeave))
    userSquares.forEach(square => square.addEventListener('drop', dragDrop))
    userSquares.forEach(square => square.addEventListener('dragEnd', dragEnd))

    var selectedShipNameWithIndex
    var draggedShip
    var draggedShipLength

    ships.forEach(ship => ship.addEventListener('mousedown', (event) => { selectedShipNameWithIndex = event.target.id }))

    function dragStart()
    {
        draggedShip = this
        draggedShipLength = this.childNodes.length

    }

    function dragOver(event) { event.preventDefault() }

    function dragEnter(event) { event.preventDefault() }

    function dragDrop()
    {
        // Invalid horizontal places for starting positions for ships 
        const notAllowedHorizontal = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 1, 11, 21, 31, 41, 51, 61, 71, 81, 91, 2,
                                      22, 32, 42, 52, 62, 72, 82, 92, 3, 13, 23, 33, 43, 53, 63, 73, 83, 93]

        // Invalid vertical places for starting positions for ships 
        const notAllowedVertical = [99, 98, 97, 96, 95, 94, 93, 92, 91, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79,
                                              78, 77, 76, 75, 74, 73, 72, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60]

        var shipNameWithLastId = draggedShip.lastChild.id
        var shipClass = shipNameWithLastId.slice(0, -2)
        var lastShipIndex = parseInt(shipNameWithLastId.substr(-1))
        var shipLastId = lastShipIndex + parseInt(this.dataset.id) 

        selectedShipIndex = parseInt(selectedShipNameWithIndex.substr(-1))

        shipLastId = shipLastId - selectedShipIndex

        var newNotAllowedHorizontal = notAllowedHorizontal.splice(0, width * lastShipIndex)
        var newNotAllowedVertical = notAllowedVertical.splice(0, width * lastShipIndex)

        if (isHorizontal && !newNotAllowedHorizontal.includes(shipLastId))
        {
            for (let i = 0; i < draggedShipLength; i++) {
                let directionClass
                if (i === 0) directionClass = 'start'
                if (i === draggedShipLength - 1) directionClass = 'end'
                userSquares[parseInt(this.dataset.id) - selectedShipIndex + i].classList.add('taken', 'horizontal', directionClass, shipClass)
                takenCount++;
            }
        }

        else if (!isHorizontal && !newNotAllowedVertical.includes(shipLastId))
        {
            for (let i = 0; i < draggedShipLength; i++) {
                let directionClass
                if (i === 0) directionClass = 'start'
                if (i === draggedShipLength - 1) directionClass = 'end'
                userSquares[parseInt(this.dataset.id) - selectedShipIndex + width * i].classList.add('taken', 'vertical', directionClass, shipClass)
                takenCount++;
            }
        }

        else return

        displayGrid.removeChild(draggedShip)

        if (!displayGrid.querySelector('.ship')) {
            allShipsPlaced = true
            infoDisplay.innerHTML = ""
        }
 
    }

    function dragLeave()
    {

    }

    function dragEnd()
    {

    }

    // Game Logic for MultiPlayer
    function playGameMulti(socket) {
        if (isGameOver) return
        if (!ready) {
            socket.emit('player-ready')
            ready = true
            playerReady(playerNum)
        }

        if (enemyReady) {
            if (currentPlayer === 'user') {
                turnDisplay.innerHTML = 'Your Go'
            }
            if (currentPlayer === 'enemy') {
                turnDisplay.innerHTML = "Enemy's Go"
            }
        }
    }

    function playerReady(num) {
        let player = `.p${parseInt(num) + 1}`
        document.querySelector(`${player} .ready`).classList.toggle('active')
    }

    // Gameplay logic for single player
    function playGameSingle()
    {
        if (allShipsPlaced == false)
        {
            infoDisplay.innerHTML = "Please place all ships below"
            return 
        }

        if (isGameOver) return

        document.getElementById("difficulty").onchange = function () {

            var currentDiff = document.getElementById("difficulty").value

            if (difficulty != currentDiff) {
                  alert('Difficulty can`t be changed during gameplay. Difficulty is already set to ' + difficulty)
                  document.getElementById("difficulty").value = difficulty
            }
        };

        if (firstTurnCheck == true) {
            infoDisplay.innerHTML = 'No ships were sunk in the water'
            firstTurnCheck = false;
        }

        if (currentPlayer === 'user') {
            turnDisplay.innerHTML = 'State Of The Game Boards :'

            computerSquares.forEach(square => square.addEventListener('click', function (e) {

                shotFired = square.dataset.id
                revealSquare(square.classList)
            }))
        }

        if (currentPlayer === 'enemy') {
            turnDisplay.innerHTML = 'State Of The Game Boards :'
            enemyGo()
        }
    }

    function revealSquare(classList) {

        const enemySquare = computerGrid.querySelector(`div[data-id='${shotFired}']`)
        const obj = Object.values(classList)

        if ((enemySquare.classList.contains('boom') || enemySquare.classList.contains('miss')) &&
            currentPlayer === 'user' && !isGameOver){
            revealSquare(classList) 
        }

        if (!enemySquare.classList.contains('boom') && currentPlayer === 'user' && !isGameOver) {
            if (obj.includes('destroyer')) cpuDestroyerCount++;
            if (obj.includes('submarine')) cpuSubmarineCount++;
            if (obj.includes('cruiser')) cpuCruiserCount++;
            if (obj.includes('battleship')) cpuBattleshipCount++;
            if (obj.includes('carrier')) cpuCarrierCount++;
        }
        
        if (obj.includes('taken')) {
            enemySquare.classList.add('boom')
            enemySquare.classList.remove('hidden')
        }
        else {
            enemySquare.classList.add('miss')
        }

        checkForWins()

        currentPlayer = 'enemy'
        if (gameMode === 'singlePlayer') playGameSingle()
    }

    function enemyGo(square)
    {
        console.log(difficulty)

        if (gameMode === 'singlePlayer')
        {
            if (difficulty === 'Normal') square = Math.floor(Math.random() * userSquares.length)

            else
            {
                var neighborSquares = []

                for (var key in userSquares)
                {

                    var elem = userSquares[key]

                    if (elem.classList.contains('boom')) {

                        if (key-1 >= 0) {

                            var neighbor = userSquares[key-1]

                            if (!neighbor.classList.contains('boom') && !neighbor.classList.contains('miss')
                                && neighbor.classList.contains('taken')) {

                                neighborSquares.push(key-1)
                            }
                        }

                        if (key-width >= 0) {

                            var neighbor = userSquares[key - width]

                            if (!neighbor.classList.contains('boom') && !neighbor.classList.contains('miss')
                                && neighbor.classList.contains('taken')) {

                                neighborSquares.push(key - width)
                            }
                        }

                        if (key+1 <= width*width-1) {

                            var neighbor = userSquares[key + 1]

                            if (!neighbor.classList.contains('boom') && !neighbor.classList.contains('miss')
                                && neighbor.classList.contains('taken')) {

                                neighborSquares.push(key + 1)
                            }
                        }

                        if (key+width <= width*width - 1) {

                            var neighbor = userSquares[key + width]

                            if (!neighbor.classList.contains('boom') && !neighbor.classList.contains('miss')
                                && neighbor.classList.contains('taken')) {

                                neighborSquares.push(key + width)
                            }
                        }
                    }
                }

                //console.log('The computer hits are ' + hitSquares)

                if (neighborSquares.length == 0) {
                    square = Math.floor(Math.random() * userSquares.length)
                    //console.log('Current normal computer square is ' + square)
                }
                else {
                    square = neighborSquares[Math.floor(Math.random() * neighborSquares.length)]
                    //console.log('Current hard computer square is ' + square)
                }
            }
        }

        if (!userSquares[square].classList.contains('boom') && userSquares[square].classList.contains('taken') &&
            !userSquares[square].classList.contains('miss')) {
            userSquares[square].classList.add('boom')
            if (userSquares[square].classList.contains('destroyer')) destroyerCount++;
            if (userSquares[square].classList.contains('submarine')) submarineCount++;
            if (userSquares[square].classList.contains('cruiser')) cruiserCount++;
            if (userSquares[square].classList.contains('battleship')) battleshipCount++;
            if (userSquares[square].classList.contains('carrier')) carrierCount++;
            checkForWins()
        }

        else if (!userSquares[square].classList.contains('boom') && !userSquares[square].classList.contains('taken') &&
            !userSquares[square].classList.contains('miss')) {
            userSquares[square].classList.add('miss')
        }

        else if (gameMode === 'singlePlayer') enemyGo()

        currentPlayer = 'user'
        if (gameMode === 'multiPlayer') turnDisplay.innerHTML = 'Your Turn'
    }

    function checkForWins() {

        var playerSinkCount = 0;
        var computerSinkCount = 0;

        // Check if the enemy wins

        if (destroyerCount === 2) {

            if (sunkPlayerDestroyer === false)
            {
                infoDisplay.innerHTML = 'Your Destroyer has been sunk'
                sunkPlayerDestroyer = true
            }

            playerSinkCount++;
        }

        if (submarineCount === 3) {

            if (sunkPlayerSubmarine === false)
            {
                infoDisplay.innerHTML = 'Your Submarine has been sunk'
                sunkPlayerSubmarine = true
            }

            playerSinkCount++;
        }

        if (cruiserCount === 3) {

            if (sunkPlayerCruiser === false) {
                infoDisplay.innerHTML = 'Your Cruiser has been sunk'
                sunkPlayerCruiser = true
            }

            playerSinkCount++;
        }

        if (battleshipCount === 4) {

            if (sunkPlayerBattleship === false)
            {
                infoDisplay.innerHTML = 'Your Battleship has been sunk'
                sunkPlayerSubmarine = true
            }

            playerSinkCount++;
        }

        if (carrierCount === 5) {

            if (sunkPlayerCarrier === false)
            {
                infoDisplay.innerHTML = 'Your Carrier has been sunk'
                sunkPlayerCarrier = true
            }

            playerSinkCount++
        }

        //***************************************************************//

        // Check if the user player wins

        if (cpuDestroyerCount === 2) {

            if (sunkComputerDestroyer === false) {
                infoDisplay.innerHTML = 'Enemy`s Destroyer has drowned'
                sunkComputerDestroyer = true
            }

            computerSinkCount++;
        }

        if (cpuSubmarineCount === 3) {

            if (sunkComputerSubmarine === false) {
                infoDisplay.innerHTML = 'Enemy`s Submarine has drowned'
                sunkComputerSubmarine = true
            }

            computerSinkCount++;
        }

        if (cpuCruiserCount === 3) {

            if (sunkComputerCruiser === false) {
                infoDisplay.innerHTML = 'Enemy`s Cruiser has drowned'
                sunkComputerCruiser = true
            }

            computerSinkCount++;
        }

        if (cpuBattleshipCount === 4) {

            if (sunkComputerBattleship === false) {
                infoDisplay.innerHTML = 'Enemy`s Battleship has drowned'
                sunkComputerBattleship = true
            }

            computerSinkCount++;
        }

        if (cpuCarrierCount === 5) {

            if (sunkComputerCarrier === false) {
                infoDisplay.innerHTML = 'Enemy`s Carrier has drowned'
                sunkComputerCarrier = true
            }

            computerSinkCount++;
        }

        if (playerSinkCount == 5) // User win case
        {
            infoDisplay.innerHTML = 'THE ENEMY SUNK YOUR SHIPS !'
            isGameOver = true
            startButton.removeEventListener('click', playGameSingle) // Stop playing the game
            computerSinkCount = -1000

            if (gameMode === 'multiPlayer')
            {
                var gameWinner = ''
                var gameLoser = ''

                if (document.getElementById("username1").innerHTML) {
                    gameLoser = document.getElementById("username1").innerHTML
                    gameWinner = 'Other'
                }

                if (document.getElementById("username2").innerHTML) {
                    gameLoser = document.getElementById("username2").innerHTML
                    gameWinner = 'Other'
                }

                post("http://localhost:3000/MultiPlayer.html", { winner: gameWinner, loser: gameLoser })
            }
        }

        if (computerSinkCount == 5) // Computer win case
        {
            infoDisplay.innerHTML = 'YOU SUNK THE ENEMY`S SHIPS !'
            isGameOver = true
            startButton.removeEventListener('click', playGameSingle) // Stop playing the game
            playerSinkCount = -1000

            if (gameMode === 'multiPlayer')
            {
                var gameWinner = ''
                var gameLoser = ''

                if (document.getElementById("username1").innerHTML) {
                    gameWinner = document.getElementById("username1").innerHTML
                    gameLoser = 'Other'
                }

                if (document.getElementById("username2").innerHTML) {
                    gameWinner = document.getElementById("username2").innerHTML
                    gameLoser = 'Other'
                }

                post("http://localhost:3000/MultiPlayer.html", { winner: gameWinner, loser: gameLoser })
            }

        }
    }
})