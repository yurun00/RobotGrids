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

$(window).on('load', function() {
  dv = $("#mainDiv")[0];
  dv.setAttribute('style', "margin: auto; width: 600px; height: 400px;");
  
  // The direction symbol image
  var dirImg = new Image();
  dirImg.src = "images/directions.png";
  // Add the direction symbol image to the main div
  dv.appendChild(dirImg);
  dirImg.setAttribute('style', "position: relative; top: -80px; left: 80px");
  
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
  
  $(document).on('keypress', function (event) {
      // If press space or 'l' or 'r'
      if(event.keyCode == 32 || event.keyCode == 108 || event.keyCode == 114) {
        event.preventDefault();    
        rbt.keybd = event.keyCode;
        rbt.update();
        grd.render();
        rbt.render();
      }
    }
  );

  // If press the 'Model 1' button, load game model 1
  document.getElementById("mode1Button").addEventListener('click', function () {
    window.location.href = "mode1.html";
  });
  
  // If press the 'Model 2' button, load game model 2
  document.getElementById("mode2Button").addEventListener('click', function () {
    window.location.href = "mode2.html";
  });
});

