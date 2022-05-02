import { constructData, easy, medium, custom } from "/data.js"

const PUZZLE = medium

const SHOW_COORDS = false
const SQ_CLASS = `sq ${SHOW_COORDS && "sq-debug"}`

const COLORS = {
  green: "green",
  blue: "blue"
}

const gridDiv = document.querySelector("#grid")
const contBtn = document.querySelector("#continue")
const solveBtn = document.querySelector("#solve")
const possiblesBtn = document.querySelector("#possibles")
const clearBtn = document.querySelector("#clear")
const clearSolBtn = document.querySelector("#clearSol")
const grid = []
const gridState = []
const quadrants = {
  q1: [], q2: [], q3: [], q4: [], q5: [], q6: [], q7: [], q8: [], q9: []
}
let hoverSquare = { x: -1, y: -1 }
let userState = [] // For storing user input

const init = () => {
  contBtn.addEventListener("click", solve1Cycle)
  solveBtn.addEventListener("click", solve)
  possiblesBtn.addEventListener("click", showPossibleNumbers)
  clearBtn.addEventListener("click", clearGrid)
  clearSolBtn.addEventListener("click", clearSolution)

  createGrid()
  attachKeyListeners()

  if (localStorage.getItem("current")) {
    userState = JSON.parse(localStorage.getItem("current"))
    const puzzleData = constructData(userState)
    puzzleData.forEach(({ x, y, val }) => {
      setInGridUser(x, y, val)
    });
  } else {
    PUZZLE.forEach(({ x, y, val }) => {
      setInGridUser(x, y, val)
    });
  }

  generateQuadrants()
}

const createDiv = (parent, { id, className, classList, text }) => {
  if (parent) {
    const div = document.createElement("div")
    if (id) div.id = id
    if (className) div.className = className
    else if (classList) div.classList = classList
    if (text) div.innerHTML = text
    parent.appendChild(div)
    return div
  } else {
    throw (`parent needs to be specified`)
  }
}

const createGrid = () => {
  for (let y = 0; y < 9; y++) {
    const row = []
    const rowGrid = []
    const rowUser = []
    const rowDiv = createDiv(gridDiv, { className: "row" })
    for (let x = 0; x < 9; x++) {
      const sq = createDiv(rowDiv, { className: SQ_CLASS, text: SHOW_COORDS ? `${x}, ${y}` : "" })
      sq.addEventListener("mouseenter", () => { hoverSquare = { x, y } })
      sq.addEventListener("mouseleave", () => { hoverSquare = { x: -1, y: -1 } })
      row.push(sq)
      rowGrid.push(0)
      rowUser.push(0)
      if (x === 2 || x === 5) {
        createDiv(rowDiv, { className: "separator-row" })
      }
    }
    grid.push(row)
    gridState.push(rowGrid)
    userState.push(rowUser)
    if (y === 2 || y === 5) {
      createDiv(gridDiv, { className: "separator-col" })
    }
  }
}

const attachKeyListeners = () => {
  document.addEventListener("keypress", (e) => {
    const { x, y } = hoverSquare
    if (x > -1 && y > -1) {
      if (["1", "2", "3", "4", "5", "6", "7", "8", "9"].indexOf(e.key) > -1) {
        setInGridUser(x, y, parseInt(e.key))
      } else {
        setInGridUser(x, y, 0)
      }
    }
  })
}

const setInGrid = (x, y, val, color = "") => {
  if (typeof val === "number") {
    gridState[y][x] = val
    grid[y][x].innerHTML = `${SHOW_COORDS ? `${x}, ${y}<br/>` : ""}${val ? val : ""}`
    grid[y][x].className = `${SQ_CLASS} ${color}`
  } else {
    throw("setInGrid val expects integer")
  }
}

const setInGridUser = (x, y, val) => {
  setInGrid(x, y, val)
  userState[y][x] = val
  localStorage.setItem("current", JSON.stringify(userState))
}

const clearGrid = () => {
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      setInGrid(x, y, 0)
      userState[y][x] = 0
    }
  }
  localStorage.setItem("current", "")
}

const clearSolution = () => {
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      if (!userState[y][x]) {
        setInGrid(x, y, 0)
      } 
    }
  }
}

const getVal = (x, y) => {
  return gridState[y][x]
}

const generateQuadrants = (x, y) => {
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      if (y < 3) {
        if (x < 3) quadrants.q1.push({ x, y })
        else if (x >= 3 && x < 6) quadrants.q2.push({ x, y })
        else if (x >= 6 && x < 9) quadrants.q3.push({ x, y })
      } else if (y >= 3 && y < 6) {
        if (x < 3) quadrants.q4.push({ x, y })
        else if (x >= 3 && x < 6) quadrants.q5.push({ x, y })
        else if (x >= 6 && x < 9) quadrants.q6.push({ x, y })
      } else {
        if (x < 3) quadrants.q7.push({ x, y })
        else if (x >= 3 && x < 6) quadrants.q8.push({ x, y })
        else if (x >= 6 && x < 9) quadrants.q9.push({ x, y })
      }
    }
  }

  console.log("Quadrants generated:")
  console.log(quadrants)
}

const getQuadrant = (_x, _y) => {
  for (let key in quadrants) {
    const quad = quadrants[key]
    for (let i = 0; i < 9; i++) {
      const { x, y } = quad[i]
      if (x === _x && y === _y) {
        return quad
      }
    }
  }
}

const getPossibleNumbers = (x, y) => {
  /* Gets all the possible numbers that can be set in a square */

  let possibleNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  let i = 0

  // Row
  for (i = 0; i < 9; i++) {
    if (i !== x) {
      const val = getVal(i, y)
      if (val > 0) {
        const valIndex = possibleNumbers.indexOf(val)
        if (valIndex > -1) {
          possibleNumbers.splice(valIndex, 1)
        }
      }
    }
  }

  // Col
  for (i = 0; i < 9; i++) {
    if (i !== y) {
      const val = getVal(x, i)
      if (val > 0) {
        const valIndex = possibleNumbers.indexOf(val)
        if (valIndex > -1) {
          possibleNumbers.splice(valIndex, 1)
        }
      }
    }
  }

  // Quad
  const quad = getQuadrant(x, y)
  for (i = 0; i < 9; i++) {
    const { x, y } = quad[i]
    const val = getVal(x, y)
    if (val > 0) {
      const valIndex = possibleNumbers.indexOf(val)
      if (valIndex > -1) {
        possibleNumbers.splice(valIndex, 1)
      }
    }
  }

  return possibleNumbers
}

const eliminateBasics = () => {
  // Naked Singles
  const possibleCells = []
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      if (getVal(x, y) === 0) {
        const possibleNumbers = getPossibleNumbers(x, y)
        if (possibleNumbers.length === 1) {
          possibleCells.push({ x, y, val: possibleNumbers[0] })
        }
      }
    }
  }

  if (possibleCells.length > 0) {
    for (let i in possibleCells) {
      const { x, y, val } = possibleCells[i]
      setInGrid(x, y, val, COLORS.green)
    }
    return true
  } else {
    return false
  }
}

const eliminateUniquesFromQuad = () => {
  // Hidden Singles
  let somethingEliminated = false
  let numbers = {
    "1": [], "2": [], "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": [],
  }

  const eliminate = () => {
    for (let num in numbers) {
      const numPositions = numbers[num]
      if (numPositions.length === 1) {
        const { x, y } = numPositions[0]
        setInGrid(x, y, parseInt(num), COLORS.blue)
        if (!somethingEliminated) {
          somethingEliminated = true
        }
      }
    }
  }

  // Row
  for (let y = 0; y < 9; y++) {
    numbers = {
      "1": [], "2": [], "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": [],
    }
    for (let x = 0; x < 9; x++) {
      if (getVal(x, y) === 0) {
        const possibleNumbers = getPossibleNumbers(x, y)
        possibleNumbers.forEach((n) => {
          numbers[n].push({ x, y })
        })
      }
    }
    eliminate()
  }

  // Col
  for (let x = 0; x < 9; x++) {
    numbers = {
      "1": [], "2": [], "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": [],
    }
    for (let y = 0; y < 9; y++) {
      if (getVal(x, y) === 0) {
        const possibleNumbers = getPossibleNumbers(x, y)
        possibleNumbers.forEach((n) => {
          numbers[n].push({ x, y })
        })
      }
    }
    eliminate()
  }

  // Quad
  for (let key in quadrants) {
    const quad = quadrants[key]
    numbers = {
      "1": [], "2": [], "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": [],
    }
    for (let i = 0; i < quad.length; i++) {
      const { x, y } = quad[i]
      if (getVal(x, y) === 0) {
        const possibleNumbers = getPossibleNumbers(x, y)
        possibleNumbers.forEach((n) => {
          numbers[n].push({ x, y })
        })
      }
    }
    eliminate()
  }

  return somethingEliminated
}

const solve1Cycle = () => {
  if (eliminateBasics()) {
    return true
  } else {
    return eliminateUniquesFromQuad()
  }
}

const solve = () => {
  let status = true
  while (status) {
    status = solve1Cycle()
  }
}

const showPossibleNumbers = () => {
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      if (getVal(x, y) === 0) {
        const possibleNumbers = getPossibleNumbers(x, y).join(" ")
        grid[y][x].innerHTML = possibleNumbers
        grid[y][x].className = "sq sq-posbl"
      }
    }
  }
}

init()