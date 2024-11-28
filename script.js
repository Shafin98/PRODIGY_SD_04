document.addEventListener("DOMContentLoaded", function () {
    const grid = document.getElementById("sudoku-grid");
    const solveButton = document.getElementById("solve-button");
    const clearButton = document.getElementById("clear-button");
  
    // Generate a 9x9 Sudoku grid
    for (let i = 0; i < 9; i++) {
      const row = document.createElement("tr");
      for (let j = 0; j < 9; j++) {
        const cell = document.createElement("td");
        const input = document.createElement("input");
        input.type = "number";
        input.min = 1;
        input.max = 9;
        input.addEventListener("input", function () {
          if (this.value.length > 1) {
            this.value = this.value.slice(0, 1);
          }
        });
        cell.appendChild(input);
        row.appendChild(cell);
      }
      grid.appendChild(row);
    }
  
    // Extract the grid values
    function getGridValues() {
      const values = [];
      Array.from(grid.querySelectorAll("tr")).forEach(row => {
        const rowValues = Array.from(row.querySelectorAll("input")).map(input =>
          input.value === "" ? 0 : parseInt(input.value, 10)
        );
        values.push(rowValues);
      });
      return values;
    }
  
    // Populate the grid with solved values
    function setGridValues(values) {
      Array.from(grid.querySelectorAll("tr")).forEach((row, i) => {
        Array.from(row.querySelectorAll("input")).forEach((input, j) => {
          input.value = values[i][j] === 0 ? "" : values[i][j];
        });
      });
    }
  
    // Sudoku Solver using Backtracking
    function solveSudoku(board) {
      function isValid(board, row, col, num) {
        for (let i = 0; i < 9; i++) {
          if (board[row][i] === num || board[i][col] === num ||
            board[Math.floor(row / 3) * 3 + Math.floor(i / 3)][Math.floor(col / 3) * 3 + i % 3] === num) {
            return false;
          }
        }
        return true;
      }
  
      function backtrack(board) {
        for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
              for (let num = 1; num <= 9; num++) {
                if (isValid(board, row, col, num)) {
                  board[row][col] = num;
                  if (backtrack(board)) return true;
                  board[row][col] = 0;
                }
              }
              return false;
            }
          }
        }
        return true;
      }
  
      backtrack(board);
      return board;
    }
  
    // Solve button listener
    solveButton.addEventListener("click", () => {
      const gridValues = getGridValues();
      const solvedGrid = solveSudoku(gridValues);
      setGridValues(solvedGrid);
    });
  
    // Clear button listener
    clearButton.addEventListener("click", () => {
      setGridValues(Array(9).fill(0).map(() => Array(9).fill(0)));
    });
  });
  