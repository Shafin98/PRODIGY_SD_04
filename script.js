document.addEventListener("DOMContentLoaded", function () {
  const grid = document.getElementById("sudoku-grid");
  const solveButton = document.getElementById("solve-button");
  const clearButton = document.getElementById("clear-button");
  const messageBox = document.getElementById("message-box"); // Element to show messages to the user

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
        if (this.value !== "") {
          this.setAttribute("data-initial", "true");
          this.style.backgroundColor = "#7a34a8";
          this.style.color = "white";
        } else {
          this.removeAttribute("data-initial");
          this.style.backgroundColor = "";
          this.style.color = "";
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

  // Highlight invalid cells
  function highlightInvalidCells(grid) {
    Array.from(grid.querySelectorAll("input")).forEach(input => {
      input.style.backgroundColor = ""; // Reset background color
    });

    // Highlight duplicates in rows, columns, and sub-grids
    function markCells(indices) {
      indices.forEach(([row, col]) => {
        const cell = grid.querySelectorAll("tr")[row].querySelectorAll("input")[col];
        cell.style.backgroundColor = "#ff9999"; // Highlight invalid cells in red
      });
    }

    const values = getGridValues();

    // Check rows
    for (let row = 0; row < 9; row++) {
      const seen = new Map();
      for (let col = 0; col < 9; col++) {
        const num = values[row][col];
        if (num !== 0) {
          if (seen.has(num)) {
            markCells([[row, col], [row, seen.get(num)]]);
          } else {
            seen.set(num, col);
          }
        }
      }
    }

    // Check columns
    for (let col = 0; col < 9; col++) {
      const seen = new Map();
      for (let row = 0; row < 9; row++) {
        const num = values[row][col];
        if (num !== 0) {
          if (seen.has(num)) {
            markCells([[row, col], [seen.get(num), col]]);
          } else {
            seen.set(num, row);
          }
        }
      }
    }

    // Check 3x3 sub-grids
    for (let rowStart = 0; rowStart < 9; rowStart += 3) {
      for (let colStart = 0; colStart < 9; colStart += 3) {
        const seen = new Map();
        for (let row = rowStart; row < rowStart + 3; row++) {
          for (let col = colStart; col < colStart + 3; col++) {
            const num = values[row][col];
            if (num !== 0) {
              const key = `${num}`;
              if (seen.has(key)) {
                markCells([[row, col], seen.get(key)]);
              } else {
                seen.set(key, [row, col]);
              }
            }
          }
        }
      }
    }
  }

  // Validate the Sudoku grid
  function isValidGrid(grid) {
    highlightInvalidCells(grid);

    function hasDuplicates(arr) {
      const seen = new Set();
      for (const num of arr) {
        if (num !== 0) {
          if (seen.has(num)) return true;
          seen.add(num);
        }
      }
      return false;
    }

    const values = getGridValues();

    // Check rows and columns
    for (let i = 0; i < 9; i++) {
      const row = values[i];
      const col = values.map(row => row[i]);
      if (hasDuplicates(row) || hasDuplicates(col)) {
        return false;
      }
    }

    // Check 3x3 sub-grids
    for (let row = 0; row < 9; row += 3) {
      for (let col = 0; col < 9; col += 3) {
        const subGrid = [];
        for (let r = row; r < row + 3; r++) {
          for (let c = col; c < col + 3; c++) {
            subGrid.push(values[r][c]);
          }
        }
        if (hasDuplicates(subGrid)) {
          return false;
        }
      }
    }

    return true;
  }

  // Display a message to the user
  function displayMessage(message, type = "error") {
    messageBox.textContent = message;
    messageBox.style.color = type === "error" ? "red" : "green";
    messageBox.style.display = "block";
  }

  // Clear the message box
  function clearMessage() {
    messageBox.textContent = "";
    messageBox.style.display = "none";
  }

  // Populate the grid with solved values
  function setGridValues(values) {
    Array.from(grid.querySelectorAll("tr")).forEach((row, i) => {
      Array.from(row.querySelectorAll("input")).forEach((input, j) => {
        if (input.hasAttribute("data-initial")) {
          // Keep the initial inputs and their styles intact
          input.style.backgroundColor = "#7a34a8"; // Retain the highlight color
          input.style.color = "white";
        } else {
          // Update other cells with solved values
          input.value = values[i][j] === 0 ? "" : values[i][j];
          input.style.backgroundColor = ""; // Reset background color for solved cells
          input.style.color = ""; // Reset text color
        }
      });
    });
  }

  // Sudoku Solver using Backtracking
  function solveSudoku(board) {
    function isValid(board, row, col, num) {
      for (let i = 0; i < 9; i++) {
        if (
          board[row][i] === num ||
          board[i][col] === num ||
          board[Math.floor(row / 3) * 3 + Math.floor(i / 3)][
            Math.floor(col / 3) * 3 + (i % 3)
          ] === num
        ) {
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
    clearMessage();
    const gridValues = getGridValues();

    if (!isValidGrid(grid)) {
      displayMessage("Invalid Sudoku grid! Please correct your input.", "error");
      return;
    }

    const solvedGrid = solveSudoku(gridValues);
    setGridValues(solvedGrid);
    displayMessage("Sudoku solved successfully!", "success");
  });

  // Clear button listener
  clearButton.addEventListener("click", () => {
    Array.from(grid.querySelectorAll("input")).forEach(input => {
      input.value = "";
      input.style.backgroundColor = "";
      input.style.color = "";
      input.removeAttribute("data-initial");
    });
    clearMessage();
  });
});
