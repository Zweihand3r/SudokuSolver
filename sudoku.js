import { constructData, easy, medium, hard, custom } from "./puzzles.js"

const SHOW_COORDS = false
const SQ_CLASS = `sq ${SHOW_COORDS && "sq-debug"}`
const SOLVE_INTERVAL = 120
const SOLVE_SHOW_POSSIBLES = true
const ONE_BY_ONE = true
const ENABLE_DIFFICULTY_SELECTION = false
const IS_MOBILE = document.body.clientWidth <= 1024
const SQ_SIZE = Math.min(document.body.clientWidth / 9 - 2, 64)
const FONT_SIZE_MAIN = 42 / 64 * SQ_SIZE
const FONT_SIZE_CANDIDATES = 17 / 64 * SQ_SIZE
const PADDING_TOP_MAIN = 10 / 64 * SQ_SIZE
const PADDING_VERT_CANDIDATES = 5 / 64 * SQ_SIZE
const PADDING_HORZ_CANDIDATES = 4 / 64 * SQ_SIZE

const PUZZLES = {
  easy, medium, hard
}

const COLORS = {
  green: "green",
  blue: "blue",
  red: "red",
  yellow: "yellow",
  purple: "purple",
  gray: "gray"
}

const gridDiv = document.querySelector("#grid")
const contBtn = document.querySelector("#continue")
const solveBtn = document.querySelector("#solve")
const possiblesBtn = document.querySelector("#possibles")
const clearBtn = document.querySelector("#clear")
const clearSolBtn = document.querySelector("#clearSol")
const diffSelect = document.querySelector("#diffSelect")
const stopBtn = document.querySelector("#stopBtn")
const desktopInfoSpan = document.querySelector("#desktop-info")
const grid = []
const gridState = []
const quadrants = {
  q1: [], q2: [], q3: [], q4: [], q5: [], q6: [], q7: [], q8: [], q9: []
}
let isSolving = false, solveIntervalId = 0
let hoverSquare = { x: -1, y: -1 }
let clickSquare = { x: -1, y: -1 }
let userState = [] // For storing user input
let isTrial = false, trialHistory = []
let activeKeypadNumber = -1

const init = () => {
  contBtn.addEventListener("click", solve1Cycle)
  solveBtn.addEventListener("click", toggleSolve)
  possiblesBtn.addEventListener("click", showPossibleNumbers)
  clearBtn.addEventListener("click", clearGrid)
  clearSolBtn.addEventListener("click", clearSolution)
  stopBtn.addEventListener("click", toggleSolve)
  if (ENABLE_DIFFICULTY_SELECTION) {
    diffSelect.addEventListener("input", e => {
      const puzzle = PUZZLES[e.target.value]
      if (puzzle) {
        clearGrid()
        puzzle.forEach(({ x, y, val }) => {
          setInGridUser(x, y, val)
        });
      }
    })
  } else {
    diffSelect.style.display = 'none'
  }

  document.addEventListener('contextmenu', e => e.preventDefault())

  if (IS_MOBILE) {
    desktopInfoSpan.innerHTML = 'Tap on a number at the bottom to select it and tap on any square on the grid to apply that number<br/><hr>'
  }

  createGrid()
  attachKeyListeners()
  attachKeypadListeners()

  if (localStorage.getItem("current")) {
    userState = JSON.parse(localStorage.getItem("current"))
    const puzzleData = constructData(userState)
    puzzleData.forEach(({ x, y, val }) => {
      setInGridUser(x, y, val)
    });
    diffSelect.value = "custom"
  } else {
    const puzzle = PUZZLES[["easy", "medium", "hard"][Math.floor(Math.random() * 3)]]
    puzzle.forEach(({ x, y, val }) => {
      setInGridUser(x, y, val)
    });
  }

  generateQuadrants()
  togglePanel()
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
      sq.addEventListener("mouseenter", () => { hoverSquare = { x, y }, clickSquare = { x: -1, y: -1 } })
      sq.addEventListener("mouseleave", () => { hoverSquare = { x: -1, y: -1 } })
      sq.addEventListener("click", () => {
        clickSquare = { x, y }
        if (IS_MOBILE && activeKeypadNumber > -1) {
          setInGridUser(x, y, activeKeypadNumber)
        }
      })
      if (IS_MOBILE) {
        sq.style.width = `${SQ_SIZE}px`
        sq.style.height = `${SQ_SIZE}px`
        sq.style.fontSize = `${42 / 64 * SQ_SIZE}px`
        sq.style.padding = `${PADDING_TOP_MAIN}px 0 0 0`
      }
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
    const isClick = x === clickSquare.x && y === clickSquare.y
    if (x > -1 && y > -1) {
      if (["1", "2", "3", "4", "5", "6", "7", "8", "9"].indexOf(e.key) > -1) {
        if (isClick) {
          setInGrid(x, y, parseInt(e.key), COLORS.gray)
        } else {
          setInGridUser(x, y, parseInt(e.key))
          diffSelect.value = "custom"
        }
      } else {
        if (isClick) {
          setInGrid(x, y, parseInt(e.key), COLORS.gray)
        } else {
          setInGridUser(x, y, 0)
          diffSelect.value = "custom"
        }
      }
    }
  })
}

const attachKeypadListeners = () => {
  const keypadBtns = []
  const handleClick = i => {
    activeKeypadNumber = i < 9 ? i + 1 : 0
    keypadBtns.forEach((btn, _i) => {
      btn.className = i === _i ? 'keypadBtnActive' : ''
    })
  }

  for (let i = 0; i < 9; i++) {
    const btn = document.querySelector(`#keypad${i + 1}`)
    keypadBtns.push(btn)
    btn.addEventListener("click", () => handleClick(i))
  }

  const btnC = document.querySelector('#keypadC')
  keypadBtns.push(btnC)
  btnC.addEventListener(
    'click', () => handleClick(9)
  )
}

const setInGrid = (x, y, val, color = "") => {
  if (typeof val === "number") {
    gridState[y][x] = val
    grid[y][x].innerHTML = `${SHOW_COORDS ? `${x}, ${y}<br/>` : ""}${val ? val : ""}`
    grid[y][x].className = `${SQ_CLASS} ${color}`
    if (IS_MOBILE) {
      grid[y][x].style.fontSize = `${FONT_SIZE_MAIN}px`
      grid[y][x].style.padding = `${PADDING_TOP_MAIN}px 0 0 0`
    }
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
  isTrial = false
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
  isTrial = false
}

const getVal = (x, y) => {
  return gridState[y][x]
}

const generateQuadrants = () => {
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

const checkIfFinished = () => {
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      if (getVal(x, y) === 0) {
        return false
      }
    }
  }
  return true
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
      setInGrid(x, y, val, isTrial ? COLORS.yellow : COLORS.green)
      if (ONE_BY_ONE) {
        return true
      }
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
        setInGrid(x, y, parseInt(num), isTrial ? COLORS.purple : COLORS.blue)
        if (ONE_BY_ONE) {
          return true
        } else if (!somethingEliminated) {
          somethingEliminated = true
        }
      }
    }
    if (ONE_BY_ONE) return false
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
    if (ONE_BY_ONE) {
      if (eliminate()) {
        return true
      }
    } else {
      eliminate()
    }
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
    if (ONE_BY_ONE) {
      if (eliminate()) {
        return true
      }
    } else {
      eliminate()
    }
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
    if (ONE_BY_ONE) {
      if (eliminate()) {
        return true
      }
    } else {
      eliminate()
    }
  }

  if (ONE_BY_ONE) {
    return false
  } else {
    return somethingEliminated
  }
}

const tryPossible = () => {
  let leastPossibles = { len: 9, possibles: [1, 2, 3, 4, 5, 6, 7, 8, 9], x: 0, y: 0 }
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      if (getVal(x, y) === 0) {
        const possibles = getPossibleNumbers(x, y)
        const len = possibles.length
        if (len < leastPossibles.len) {
          leastPossibles = { len, possibles, x, y }
        }
      }
    }
  }
  const { possibles, x, y } = leastPossibles
  const index = 0
  trialHistory.push({
    x, y, index, possibles,
    snapshot: JSON.parse(JSON.stringify(gridState))
  })
  setInGrid(x, y, possibles[index], COLORS.red)
}

const checkDeadEnd = () => {
  /**
   * Returns
   * 0: No solution
   * 1: Dead end
   * 2: No dead end
   */
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      if (getVal(x, y) === 0) {
        const possibleNumbers = getPossibleNumbers(x, y)
        if (possibleNumbers.length === 0) {
          console.log("Reached dead end!")
          if (trialHistory.length > 0) {
            const { x, y, index, possibles, snapshot } = trialHistory[trialHistory.length - 1]
            const nextPossible = possibles[index + 1]
            if (index + 1 === possibles.length - 1) {
              trialHistory.pop()
            } else {
              trialHistory[trialHistory.length - 1].index += 1
            }
            for (let _y = 0; _y < 9; _y++) {
              for (let _x = 0; _x < 9; _x++) {
                if (snapshot[_y][_x] === 0) {
                  setInGrid(_x, _y, 0)
                }
              }
            }
            setInGrid(x, y, nextPossible, COLORS.red)

            return 1
          } else {
            alert("Cannot find solution :(")
            return 0
          }
        }
      }
    }
  }

  return 2
}

const trialAndForce = () => {
  if (checkIfFinished()) {
    return false
  } 

  if (!isTrial) {
    isTrial = true
    trialHistory = []
  }

  tryPossible()

  return true
}

const solve1Cycle = () => {
  let rv = true

  if (checkDeadEnd()) {
    if (!eliminateBasics()) {
      if (!eliminateUniquesFromQuad()) {
        if (!trialAndForce()) {
          rv = false
        }
      }
    }
  } else {
    rv = false
  }

  if (SOLVE_SHOW_POSSIBLES) {
    showPossibleNumbers()
  }
  return rv
}

const solve = () => {
  let status = true
  solveIntervalId = setInterval(() => {
    if (status) {
      status = solve1Cycle()
    } else {
      console.log("Can't go on!")
      clearInterval(solveIntervalId)
      isSolving = false
      isTrial = false
      togglePanel()
    }
  }, SOLVE_INTERVAL)
}

const toggleSolve = () => {
  if (!isSolving) {
    solve()
    isSolving = true
  } else {
    clearInterval(solveIntervalId)
    isSolving = false
  }
  togglePanel()
}

const togglePanel = () => {
  contBtn.style.display = isSolving ? "none" : "block"
  solveBtn.style.display = isSolving ? "none" : "block"
  possiblesBtn.style.display = isSolving ? "none" : "block"
  clearBtn.style.display = isSolving ? "none" : "block"
  clearSolBtn.style.display = isSolving ? "none" : "block"
  diffSelect.style.display = isSolving || !ENABLE_DIFFICULTY_SELECTION ? "none" : "block"
  solveBtn.style.display = isSolving ? "none" : "block"

  stopBtn.style.display =  isSolving ? "block" : "none"
}

const formatPossibles = (possibles) => {
  const chars = []
  for (let n = 1; n <= 9; n++) {
    chars.push(
      possibles.indexOf(n) > -1 ? `${n}` : '&nbsp'
    )
  }
  return `${chars[0]} ${chars[1]} ${chars[2]} ${chars[3]} ${chars[4]} ${chars[5]} ${chars[6]} ${chars[7]} ${chars[8]}`
}

const showPossibleNumbers = () => {
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      if (getVal(x, y) === 0) {
        const possibleNumbers = getPossibleNumbers(x, y)
        grid[y][x].innerHTML = formatPossibles(possibleNumbers)
        grid[y][x].className = "sq sq-posbl"
        if (IS_MOBILE) {
          grid[y][x].style.fontSize = `${FONT_SIZE_CANDIDATES}px`
          grid[y][x].style.padding = `${PADDING_VERT_CANDIDATES}px ${PADDING_HORZ_CANDIDATES}px`
        }
      }
    }
  }
}

init()