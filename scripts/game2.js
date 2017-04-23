// Globals
var cvs; //Canvas
var ctx; //Context
var cRow = 8; // Canvas row amount
var cCol = 8; // Canvas column amount
var sideLen = 40; // Grid side length
var rbt = null; // Robot object
var grd = null; // Grid object
var keySeq = []; // Keyboard input sequence
// Convert charactor to direction vector
var ch2arr = {'W': [0,-1], 'S': [-1, 0], 'E': [0, 1], 'N':[1, 0]};
// Key is calculated by (dir[0] + 2 * dir[1] + 2)
var arr2ch = {0: 'W', 1: 'S', 4: 'E', 3: 'N'};
var startRow = 0;
var startCol = 0;
var startF = "";
var paths = [];

// Robot object
function robot() {
  this.width = 32;
  this.height = 32;

  this.x = 1;
  this.y = 1;
  
  // Direction of the robot face
  // W: [0, -1], S: [-1, 0], E: [0, 1], N:[1, 0]
  this.direction = [0, 1];
  // Store the keyboard input
  this.keybd = 0;
  // Robots source image
  this.image = new Image();
  // Robot position in the source image 
  this.robotPos = 0;

  this.render = function () {
    var pdW = (sideLen - this.width) / 2, pdH = (sideLen - this.width) / 2;
    // DrawImage parameters:
    //    Image contain all robots
    //    Postion of the robot in the image
    //    Postion of the robot in the image
    //    Width and height to use from the source image
    //    x and y coordinates of the robot on canvas
    //    Width and height of the robot on canvas
    ctx.drawImage(this.image, this.robotPos * this.width, 0, this.width, this.height, (this.x - 1) * sideLen + pdW, (this.y - 1) * sideLen + pdH, this.width, this.height);
    // Show the current information in HTML
    document.getElementById("nowRow").innerHTML = this.y;
    document.getElementById("nowCol").innerHTML = this.x;
    document.getElementById("nowFace").innerHTML = arr2ch[this.direction[0] + 2 * this.direction[1] + 2];
  };
  
  this.update = function () {
    // Update robot information according to key code 
    switch (this.keybd) {
      // Space to move, need to consider the border conditions
      case 32: 
        if((this.direction[0] == 0 && this.direction[1] == -1 && this.y > 1) 
          || (this.direction[0] == 1 && this.direction[1] == 0 && this.x < cCol) 
          || (this.direction[0] == 0 && this.direction[1] == 1 && this.y < cRow) 
          || (this.direction[0] == -1 && this.direction[1] == 0 && this.x > 1))
          this.move();
        break;
      // 'L' to left
      case 108: 
        this.toLeft();
        break;
      // 'R' to right
      case 114:
        this.toRight();
        break;
      default: ;
    }
  };
  
  // We defined W: [0, -1], S: [-1, 0], E: [0, 1], N:[1, 0]
  // The computation rule is not hard to understand
  this.move = function () {
    console.log("move");
    this.x += this.direction[0];
    this.y += this.direction[1];
  };
  
  this.toLeft = function () {
    console.log("toLeft");
    var old0 = this.direction[0], old1 = this.direction[1];
    this.direction[0] = (old0 != 0) ? 0 : old1;
    this.direction[1] = (old1 != 0) ? 0 : -old0;
    this.robotPos = 3 + this.direction[0] - 3 * this.direction[1];
  }
  
  this.toRight = function () {
    console.log("toRight");
    var old0 = this.direction[0], old1 = this.direction[1];
    this.direction[0] = (old0 != 0) ? 0 : -old1;
    this.direction[1] = (old1 != 0) ? 0 : old0;
    this.robotPos = 3 + this.direction[0] - 3 * this.direction[1];
  }
}

// Grid object
function grid() {
  this.width = cCol * sideLen;
  this.height = cRow * sideLen;

  // Two kinds of grid
  this.images = [];
  this.images[0] = new Image();
  this.images[1] = new Image();

  // Show the grid on canvas
  this.render = function () {
    for (var i = 0;i < cRow;i++) 
      for (var j = 0;j < cCol;j++) {
        var img = ((i+j) % 2 == 0) ? this.images[0] : this.images[1];
        ctx.drawImage(img, 0, 0, sideLen, sideLen, i * sideLen, j * sideLen, sideLen, sideLen);
      }
  }
}

// Given initial state and target state, return all possible paths
function calcPath(x0, y0, f0, x1, y1, f1, n) {
  // x means row number, y means column number, different from the robot though...
  x0 -= 1;
  y0 -= 1;
  x1 -= 1;
  y1 -= 1;
  // Dynamic programming, explanation in README
  var dp = new Array(n+1);
  for (var i = 0; i < n+1; i++) {
    dp[i] = new Array(4);
    for (var f = 0; f < 4; f++) {
      dp[i][f] = new Array(8);
      for (var x = 0; x < 8; x++) {
        dp[i][f][x] = new Array(8);
        for (var y = 0; y < 8;y++) {
          dp[i][f][x][y] = false;
        }
      }
    }
  }
  // Possible reaching state for each number of actions
  dp[0][f0][x0][y0] = true;
  for (var i = 1; i < n+1; i++) {
    for (var f = 0; f < 4; f++) {
      for (var x = 0; x < 8; x++) {
        for (var y = 0; y < 8;y++) {
          if (dp[i-1][(f+3)%4][x][y] || dp[i-1][(f+1)%4][x][y])
              dp[i][f][x][y] = true;
          var d1 = [x+1, x, x-1, x];
          var d2 = [y, y+1, y, y-1];
          if (d1[f] >= 0 && d1[f] <= 7 && d2[f] >= 0 && d2[f] <= 7 && dp[i-1][f][d1[f]][d2[f]])
              dp[i][f][x][y] = true;
        }
      }
    }
  }
  // Back tracking
  var res = [];
  if (x0 == x1 && y0 == y1 && f0 == f1)
    res.push("");
  for (var i = 1; i < n+1; i++) {
    var cur = "";
    bt(res, dp, x1, y1, f1, i, cur);
  }
  return res;
}

function bt(res, dp, x, y, f, n, cur) {
  if (n == 0) {
      res.push(cur);
      return;
  }
  
  if (dp[n-1][(f+3)%4][x][y])
      bt(res, dp, x, y, (f+3)%4, n-1, 'L'+cur);
  if (dp[n-1][(f+1)%4][x][y])
      bt(res, dp, x, y, (f+1)%4, n-1, 'R'+cur);
  var d1 = [x+1, x, x-1, x];
  var d2 = [y, y+1, y, y-1];
  if (d1[f] >= 0 && d1[f] <= 7 && d2[f] >= 0 && d2[f] <= 7 && dp[n - 1][f][d1[f]][d2[f]])
      bt(res, dp, d1[f], d2[f], f, n-1, 'M'+cur);
}


  
$(window).on('load', function() {
  dv = $("#canvasDiv")[0];
  
  // The direction symbol image
  var dirImg = new Image();
  dirImg.src = "images/directions.png";
  // Add the direction symbol image to the main div
  dv.appendChild(dirImg);
  dirImg.setAttribute('style', "position: relative; top: -80px; left: 100px");
  
  // Create a reference for the canvas
  cvs = $("#mainCanvas")[0];
  // Set width and height of the canvas
  cvs.width = cRow * sideLen;
  cvs.height = cCol * sideLen;
  cvs.setAttribute('style', "margin: auto; position: relative; top: 35px; left: 40px");
  
  // Create a context object from the canvas
  ctx = cvs.getContext("2d");
  // Set background color
  ctx.fillStyle = "#110000";
  // Fill the canvas with color
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  
  // Create a grid object
  grd = new grid();
  // Set source image
  grd.images[0].src = "images/blue.png";
  grd.images[1].src = "images/deepBlue.png";
  // Render grid image after loaded
  grd.images[0].onload = function() {
    grd.render();
  };
  
  // Create a robot object
  rbt = new robot();
  // Set source image
  rbt.image.src = "images/Mage_Sprite.png";
  // Render robot image after loaded
  rbt.image.onload = function() {
    rbt.render();
  };

  // If press the 'Go' button, move the robot following the sequence
  document.getElementById("goButton").addEventListener('click', function () {
    // Get the start position
    startRow = parseInt(document.getElementsByName('startRow')[0].value);
    startCol = parseInt(document.getElementsByName('startCol')[0].value);
    // The situation where the start position is out of range
    if(startRow < 1 || startRow > 8 || startCol < 1 || startCol > 8) {
      alert("Initial state invalid!");
      return ;
    }
    // Get the start face direction
    startF = "";
    for (var i = 0;i < 4;i++) {
      if (document.getElementsByName('face')[i].checked)
        startF = document.getElementsByName('face')[i].value;
    }
    // Get the maximum actinos
    var maxAct = parseInt(document.getElementsByName('maxAct')[0].value);
    
    // Get target state information
    var targetRow = parseInt(document.getElementsByName('targetRow')[0].value);
    var targetCol = parseInt(document.getElementsByName('targetCol')[0].value);
    // The situation where the start position is out of range
    if(targetRow < 1 || targetRow > 8 || targetCol < 1 || targetCol > 8) {
      alert("Target state invalid!");
      return ;
    }
    // Get the start face direction
    var targetF = "";
    for (var i = 0;i < 4;i++) {
      if (document.getElementsByName('tFace')[i].checked)
        targetF = document.getElementsByName('tFace')[i].value;
    }
    
    // Initialize the robot
    rbt.x = startCol;
    rbt.y = startRow;
    rbt.direction = ch2arr[startF].slice();
    // Choose robot image of the face direction
    rbt.robotPos = 3 + rbt.direction[0] - 3 * rbt.direction[1];
    grd.render();
    rbt.render();
    // Direction value for calculate the paths
    var dirToVal = {'W': 0, 'S': 1, 'E': 2, 'N': 3};
    // Get the results of all possible paths
    paths = calcPath(startRow, startCol, dirToVal[startF], targetRow, targetCol, dirToVal[targetF], maxAct);
    // Before adding paths to 'select' tag, clear the tag
    var sel = document.getElementById('opSeq');
    sel.options.length = 0;
    // Add default option for the sake of 'change' event
    var option = document.createElement("option");
    option.text = 'default';
    sel.add(option);
    // Add all paths to 'select' tag
    for (var i = 0;i < paths.length;i++) {
      var option = document.createElement("option");
      option.text = paths[i];
      sel.add(option);
    }
  });
  
  // Add 'change' event to 'select' tag, trigger the event will move the robot
  document.getElementById('opSeq').addEventListener('change', function () {
    // Start from start state
    rbt.x = startCol;
    rbt.y = startRow;
    rbt.direction = ch2arr[startF].slice();
    rbt.robotPos = 3 + rbt.direction[0] - 3 * rbt.direction[1];
    grd.render();
    rbt.render();

    // Show the robot movement defined by charactor seqence with delay
    var opSeq = this.value;
    if(opSeq == 'default')
      return ;
    for (var k = 0;k < opSeq.length;k++) {
      setTimeout(robotOp.bind(this, opSeq[k]), 500*(k+1));
    }
    setTimeout(function () {alert("Finished!");}, 500*(k+1));
  });
  
  function robotOp(k) {
    // Convert the key to key code, 'M' means move and space code is defined as move
    switch (k) {
      case 'M': case 'm': rbt.keybd = 32; break;
      case 'L': case 'l': rbt.keybd = 108; break;
      case 'R': case 'r': rbt.keybd = 114; break;
      default: return;
    }
    rbt.update();
    grd.render();
    rbt.render();
  }
  
  // If press the 'Back' button, load chose model page
  document.getElementById("backButton").addEventListener('click', function () {
    window.location.href = "index.html";
  });
  
  // If press the 'Save' button, save solution to the file
  document.getElementById("saveButton").addEventListener('click', function () {
    var newWindow = window.open();
    for (p of paths) {
      newWindow.document.write(p.split('').join(','))
      newWindow.document.write('<br>');
    }
    newWindow.focus();
  });
});

