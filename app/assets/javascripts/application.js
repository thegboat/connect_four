// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require_tree .


var waiting;
var gameover;
var board;

function new_game(){
  board = {};
  for(var x=0;x<7;x++){
    board[x] = {};
  }

  $('.board button').removeClass('red')
  $('.board button').removeClass('black')

  waiting = false;
  gameover = false;
  $("#result").html("")

}

function add_at(col,row, player){
  var selector = "[name='" + col + '_' + row + "']";
  board[col][row] = player;
  $(selector).addClass(player);
}

function predict(col,row,player){
  // if i place a chip here ...
  board[col][row] = player;
  var tie = true;
  //for optimization only; these limit range of checks
  var xn = col-3 > 0 ? col-3 : 0
  var xx = col+3 < 6 ? col+3 : 6
  var yn = row-3 > 5 ? row-3 : 0
  var yx = row+3 < 5 ? row+4 : 5
  for(var x=0;x<6;x++){
    tie = tie && !!board[x][5];
    if(x<xn || x>xx) continue;
    for(var y=yn;y<yx;y++){
      //for optimization only; these limit only possible paths
      var diag1 = y>2&&x<4;
      var diag2 = y>2&&x>3;
      var vert = y<3;
      var horz = x<4;
      for(var d=0;d<4;d++){
        //nw-se
        diag1 = diag1 && board[x+d][y-d] == player;
        //ne-sw
        diag2 = diag2 && board[x-d][y-d] == player;
        vert = vert && board[x][y+d] == player;
        horz = horz && board[x+d][y] == player;
        if(diag2 && diag1 && vert && horz) break;
      }
      if(diag2 || diag1 || vert || horz){
        // remove the chip we just wanted to know what if
        board[col][row] = undefined;
        return player;
      }
    }
  }

  // remove the chip we just wanted to know what if
  board[col][row] = undefined;
  if(tie) return 'tie';
  return null;
}

function player_turn(col,row){
  //if we place the chip what will happen
  var result = predict(col,row,'red');
  //place
  add_at(col,row,'red');
  //make it happen
  return end_message(result);
}

//display a message for ending game
function end_message(winner){
  switch(winner){
    case 'red' :
      $("#result").html("Red Player Wins")
      break;
    case 'black' :
      $("#result").html("Black Player Wins")
      break;
    case 'tie' :
      $("#result").html("The Game Is A Tie")
      break;
    default : 
      return false
  }
  return true
}

function computer_turn(){
  var block;
  var move = [];
  var col,row;
  //predict what would happen if i placed a chip in each open position
  for(col=0;col<7;col++){
    if(board[col][5]) continue;
    row = get_lowest_row(col);
    var result;
    //check if computer can win first if so just do it
    if(result = predict(col,row,'black')){
      add_at(col,row,'black');
      return end_message(result);
    //check if we need to block
    }else if(predict(col,row,'red')){
      block=[col,row]
    }else{
     //collect open moves
      move.push([col,row])
    }
  }

  //we couldnt win, lets block
  if(block){
    add_at(block[0],block[1],'black');
    return false;
  //we couldnt win or block just move randomly
  }else if(move.length){
    var r = rand(move.length)
    add_at(move[r][0],move[r][1],'black');
    return false;
  // this shouldnt happen but if it does must be a tie
  }else{
    end_message('tie');
    return true;
  }

}

function rand(max) {
  max = Math.floor(max);
  return Math.floor(Math.random() * max);
}

// can only move in lowest position
function get_lowest_row(col){
  var row=-1;
  if(!board[col][5]){
    for(row=0;row<6;row++){
      if(!board[col][row]) break;
    }
  }
  return row;
}

$(document).ready(function() {
    new_game();
    $('.board button').click(function(e) {

      if(waiting || gameover) return;
      waiting = true;
      var col = $(this).closest('tr').find('td').index($(this).closest('td'));
      var row = get_lowest_row(col);

      if(row<0){
        waiting = false;
        return;
      }

      gameover = player_turn(col,row);
      gameover = gameover || computer_turn();
      waiting = false;
    });

    $('#new_game').click(function(e) {
      new_game();
    });

});
