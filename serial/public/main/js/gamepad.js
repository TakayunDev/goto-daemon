// ゲームパッドの接続通知
window.addEventListener("gamepadconnected",
  function(e){
    console.log("Gamepad conected at index %d: %s. %d buttons, %d axes.",e.gamepad.index, e.gamepad.id,e.gamepad.buttons.length, e.gamepad.axes.length);
    window.alert("Gamepad conected.");
  }
);
// ゲームパッドの切断通知
window.addEventListener("gamepaddisconnected", function(e) {
  console.log("Gamepad disconected at index %d.", e.gamepad.index);
  window.alert("Gamepad disconected.");
});
// ゲームパッド接続と同時にゲームパッド操作可能状態へ移行
window.addEventListener("gamepadconnected", function(e) {
  var gp = navigator.getGamepads()[e.gamepad.index];
  controllLoop();
});

var interval;

if (!('ongamepadconnected' in window)) {
  // No gamepad events available, poll instead.
  interval = setInterval(pollGamepads, 500);
}

function pollGamepads() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
  for (var i = 0; i < gamepads.length; i++) {
    var gp = gamepads[i];
    if (gp) {
      controllLoop();
      clearInterval(interval);
    }
  }
}
function buttonPressed(b) {
  if (typeof(b) == "object") {
    return b.pressed;
  }
  return b == 1.0;
}

// Commands Dictionary
var moveCommands = {
  foward : [false, 'foward'],
  back : [false, 'back'],
  left : [false, 'left'],
  right : [false, 'right'],
  stop : [false, 'stop']
};
var armCommands = {
  grasp   : [false, 'hand/grasp'],
  release : [false, 'hand/release'],
  addArg  : function(servo_num, reverse){
    var rev = (reverse == true)?　-1 : 1;
    return [false, function(axe_value){return 'rargadd/'+servo_num+'/'+(rev*axe_value)}]
  }
};
var extensionCommands = {
  cageOpen : [false, 'cage/open'],
  cageClose : [false, 'cage/close'],
  changeState : function(states){return [false, 'state/'+states]}
};
var legCommands = {
  set : function(where, reverse) {
    var rev = (reverse == true)?　-1 : 1;
    return [false, function(arg){return 'set/'+where+'/'+arg}]
  },
  add : function(where, reverse) {
    var rev = (reverse == true)?　-1 : 1;
    return [false, function(axe_value){return 'add/'+where+'/'+(rev*axe_value)}]
  }
}
// Profile of Gamepad
var gamepadProfileMoving = {
  12: moveCommands.foward,
  13: moveCommands.back,
  14: moveCommands.left,
  15: moveCommands.right
}
var gamepadProfileExtension = {
  6 : extensionCommands.cageOpen,
  7 : extensionCommands.cageClose,
  0 : extensionCommands.changeState('startToGetBall')
}
var gamepadProfileArm = {
  11: 'light/toggle',
  axes  : {
    0 : armCommands.addArg(0, false),
    1 : armCommands.addArg(1, true),
    3 : armCommands.addArg(2, true)
  }
}
var gamepadProfileLeg = {
  axes : {
    1 : legCommands.add('front', false),
    3 : legCommands.add('rear', true)
  }
}
//var moveCommands = ['foward', 'back', 'left', 'right', 'stop'];
var lightCommand = 'light/toggle';
var last_move_command = moveCommands.stop;
var last_arm_command = '';
var last_light_button = false;

var sendMoveCommand = function(cmd) {
  if (cmd[0] == false) {
    cmd[0] = true;
    if (cmd != last_move_command) {
      last_move_command[0] = false;
    }
    last_move_command = cmd;
    sendCommandMove(cmd[1]);
    console.log("Command of "+cmd[1]+" sent.");  
  }
}
var sendLightCommand = function(cmd) {
  if (lightCommand == cmd && !last_light_button) {
    last_light_button = true;
    setTimeout(function(){last_light_button = false}, 50);
    sendCommandArm(cmd);
    console.log("Command of "+cmd+" sent.");
  }
}
var sendExtensionCommand = function(cmd) {
  if (cmd[0] == false) {
    cmd[0] = true;
    setTimeout(function(){cmd[0] = false}, 300);
    sendCommandExtension(cmd[1]);
    console.log("Command of "+cmd+" sent.");
  }
}
var sendArmCommand = function(cmd, axe_value) {
  if (cmd[0] == false) {
    cmd[0] = true;
    setTimeout(function(){cmd[0] = false}, 50);
    var buff = '';
    if (axe_value == undefined) {
      buff = cmd[1];
    } else if (!isNaN(axe_value)) {
      buff = cmd[1](axe_value);
    }
    if ( buff != '' ) {
      sendCommandArm(buff);
      console.log("Command of "+buff+" sent.");
    }
  }
}
var sendLegCommand = function(cmd, axe_value) {
  if (cmd[0] == false) {
    cmd[0] = true;
    setTimeout(function(){cmd[0] = false}, 50);
    var buff = '';
    if (axe_value == undefined) {
      buff = cmd[1];
    } else if (!isNaN(axe_value)) {
      buff = cmd[1](axe_value);
    }
    if ( buff != '' ) {
      sendCommandLeg(buff);
      console.log("Command of "+buff+" sent.");
    }
  }
}

var axe_mode = 'arm';
function controllLoop() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
  if (!gamepads) {
    return;
  }

  var gp = gamepads[0];
  var move_pressed = false;
  
  for (var i in (buttons = gp.buttons)) {
    if ( buttons[i].pressed ) {
      console.log("Now pressed "+i);
    }
    // About Move
    if( buttons[i].pressed ? cmd=gamepadProfileMoving[i]:false ) {
      if (last_move_command == moveCommands.stop) {
        sendMoveCommand(cmd);  
      }
      move_pressed = true;
    }
    if( buttons[i].pressed ? cmd=gamepadProfileExtension[i]:false ) {
        sendExtensionCommand(cmd);  
    }
    // About Arm
    if( buttons[i].pressed ? cmd=gamepadProfileArm[i]:false ) {
      sendLightCommand(cmd);
    }
    // Mode Setting
    if ( buttons[i].pressed ) {
      if (i == 8) {
        axe_mode = 'leg';
        console.log('Now mode is "leg"');
      }
      if (i == 9) {
        axe_mode = 'arm'
        console.log('Now mode is "arm"');
      }
    }
  }
  if (!move_pressed) { 
    sendMoveCommand(moveCommands.stop);
  }
  /* axes : List = [Lx, Ly, Rx, Ry]
   * Left=-1, Right=1, Up=-1, Down=1
   */
  if (gp.axes[2] == -1) {
    sendArmCommand(armCommands.grasp);
  }
  if (gp.axes[2] == 1) {
    sendArmCommand(armCommands.release);
  }
  

  if (axe_mode == 'arm') {
    for (var axe_num in gamepadProfileArm.axes) {
      var axe_value = ~~(gp.axes[axe_num]*4);
      if ( Math.abs(axe_value) > 1 ) {
        if (axe_value > 0) axe_value -= 1;
        else axe_value += 1;
        sendArmCommand(gamepadProfileArm.axes[axe_num], axe_value);
      }
    }
  }
  else if (axe_mode == 'leg') {
    for (var axe_num in gamepadProfileLeg.axes) {
      var axe_value = ~~(gp.axes[axe_num]*4);
      if ( Math.abs(axe_value) > 1 ) {
        if (axe_value > 0) axe_value -= 1;
        else axe_value += 1;
        sendLegCommand(gamepadProfileLeg.axes[axe_num], axe_value);
      }
    }
  }
  
  
  start = requestAnimationFrame(controllLoop);
}
