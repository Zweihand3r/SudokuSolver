const constructData = (arr) => {
  const custom = []
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      if (arr[y][x] > 0) {
        custom.push({ x, y, val: arr[y][x] })
      }
    }
  }
  return custom
}

const _new = [
  [0, 0, 0,   0, 0, 0,   0, 0, 0],
  [0, 0, 0,   0, 0, 0,   0, 0, 0],
  [0, 0, 0,   0, 0, 0,   0, 0, 0],

  [0, 0, 0,   0, 0, 0,   0, 0, 0],
  [0, 0, 0,   0, 0, 0,   0, 0, 0],
  [0, 0, 0,   0, 0, 0,   0, 0, 0],
  
  [0, 0, 0,   0, 0, 0,   0, 0, 0],
  [0, 0, 0,   0, 0, 0,   0, 0, 0],
  [0, 0, 0,   0, 0, 0,   0, 0, 0],
]

export const custom = constructData(_new)

export const easy = [
  { x: 2, y: 0, val: 4 },
  { x: 4, y: 0, val: 5 },
  { x: 0, y: 1, val: 9 },
  { x: 3, y: 1, val: 7 },
  { x: 4, y: 1, val: 3 },
  { x: 5, y: 1, val: 4 },
  { x: 6, y: 1, val: 6 },
  { x: 2, y: 2, val: 3 },
  { x: 4, y: 2, val: 2 },
  { x: 5, y: 2, val: 1 },
  { x: 7, y: 2, val: 4 },
  { x: 8, y: 2, val: 9 },
  { x: 1, y: 3, val: 3 },
  { x: 2, y: 3, val: 5 },
  { x: 4, y: 3, val: 9 },
  { x: 6, y: 3, val: 4 },
  { x: 7, y: 3, val: 8 },
  { x: 1, y: 4, val: 9 },
  { x: 7, y: 4, val: 3 },
  { x: 1, y: 5, val: 7 },
  { x: 2, y: 5, val: 6 },
  { x: 4, y: 5, val: 1 },
  { x: 6, y: 5, val: 9 },
  { x: 7, y: 5, val: 2 },
  { x: 0, y: 6, val: 3 },
  { x: 1, y: 6, val: 1 },
  { x: 3, y: 6, val: 9 },
  { x: 4, y: 6, val: 7 },
  { x: 6, y: 6, val: 2 },
  { x: 2, y: 7, val: 9 },
  { x: 3, y: 7, val: 1 },
  { x: 4, y: 7, val: 8 },
  { x: 5, y: 7, val: 2 },
  { x: 8, y: 7, val: 3 },
  { x: 4, y: 8, val: 6 },
  { x: 6, y: 8, val: 1 }
]

export const medium = constructData([
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 8, 0, 0, 0, 5, 0, 4],
  [0, 4, 0, 3, 0, 2, 1, 0, 0],
  [0, 0, 1, 5, 0, 4, 2, 9, 0],
  [0, 0, 0, 0, 0, 0, 8, 0, 3],
  [0, 0, 2, 8, 0, 0, 0, 1, 0],
  [0, 8, 3, 2, 9, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 3, 0, 0, 9],
  [0, 6, 0, 0, 5, 0, 0, 7, 0],
])