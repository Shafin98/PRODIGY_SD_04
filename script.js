document.addEventListener("DOMContentLoaded", function () {
  const grid = document.getElementById("sudoku-grid");
  const solveButton = document.getElementById("solve-button");
  const clearButton = document.getElementById("clear-button");
  const messageBox = document.getElementById("message-box");

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

  // Extract grid values
  function getGridValues() {
    const values = [];
    Array.from(grid.querySelectorAll("tr")).forEach((row) => {
      const rowValues = Array.from(row.querySelectorAll("input")).map((input) =>
        input.value === "" ? 0 : parseInt(input.value, 10)
      );
      values.push(rowValues);
    });
    return values;
  }

  // Highlight invalid cells
  function highlightInvalidCells() {
    const values = getGridValues();
    let hasInvalidCells = false;

    Array.from(grid.querySelectorAll("input")).forEach((input) => {
      input.style.backgroundColor = ""; 
    });

    // Check rows, columns, and sub-grids for duplicates
    function markInvalidCells(indices) {
      indices.forEach(([row, col]) => {
        const cell = grid.querySelectorAll("tr")[row].querySelectorAll("input")[col];
        cell.style.backgroundColor = "#ff9999"; 
      });
      hasInvalidCells = true;
    }

    // Check rows
    for (let row = 0; row < 9; row++) {
      const seen = new Map();
      for (let col = 0; col < 9; col++) {
        const num = values[row][col];
        if (num !== 0) {
          if (seen.has(num)) {
            markInvalidCells([
              [row, col],
              [row, seen.get(num)],
            ]);
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
            markInvalidCells([
              [row, col],
              [seen.get(num), col],
            ]);
          } else {
            seen.set(num, row);
          }
        }
      }
    }

    // Check 3x3 sub-grids
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const seen = new Map();
        for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
          for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
            const num = values[row][col];
            if (num !== 0) {
              const key = `${num}`;
              if (seen.has(key)) {
                markInvalidCells([
                  [row, col],
                  seen.get(key),
                ]);
              } else {
                seen.set(key, [row, col]);
              }
            }
          }
        }
      }
    }

    return hasInvalidCells;
  }

  // Disable all inputs
  function disableGridInputs() {
    Array.from(grid.querySelectorAll("input")).forEach((input) => {
      input.disabled = true;
    });
  }

  // Enable all inputs
  function enableGridInputs() {
    Array.from(grid.querySelectorAll("input")).forEach((input) => {
      input.disabled = false;
    });
  }

  // Display a message
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

  // Populate grid with solved values
  function setGridValues(values) {
    Array.from(grid.querySelectorAll("tr")).forEach((row, i) => {
      Array.from(row.querySelectorAll("input")).forEach((input, j) => {
        if (input.hasAttribute("data-initial")) {
          input.style.backgroundColor = "#7a34a8";
          input.style.color = "white";
        } else {
          input.value = values[i][j] === 0 ? "" : values[i][j];
          input.style.backgroundColor = "";
          input.style.color = "";
        }
      });
    });
  }

  // Sudoku solver using backtracking
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
    const gridValues = getGridValues();

    // Highlight invalid inputs
    if (highlightInvalidCells()) {
      displayMessage("Invalid Sudoku inputs! Fix the highlighted cells.", "error");

      // Disable all inputs to prevent further changes
      disableGridInputs();

      solveButton.disabled = true; // Disable solve button until grid is cleared
      return;
    }

    // Solve the Sudoku if valid
    const solvedGrid = solveSudoku(gridValues);
    setGridValues(solvedGrid);

    // Disable inputs after solving successfully
    disableGridInputs();
    solveButton.disabled = true; 

    displayMessage("Sudoku solved successfully!", "success");
  });



    // Clear button listener
    clearButton.addEventListener("click", () => {
      Array.from(grid.querySelectorAll("input")).forEach((input) => {
        input.value = "";
        input.style.backgroundColor = "";
        input.style.color = "";
        input.removeAttribute("data-initial");
        input.disabled = false; 
      });
    
      solveButton.disabled = false; 
      clearMessage(); 
    });    
});
