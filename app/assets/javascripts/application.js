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

var board = {};
for(var x=0;x<7;x++){
  board[x] = {};
}

var waiting = false;
var gameover = false;

function add_at(col,row, player){
  var selector = "[name='" + col + '_' + row + "']";
  alert(selector)
  board[col][row] = player;
  $(selector).addClass(player);
}

function check_winner(col,row,player){
  var tie = true;
  for(var x=0;x<7;x++){
    tie = tie && !!board[x][5];
    for(var y=0;y<6;y++){
      var diag1 = y>2&&x<4;
      var diag2 = y>2&&x>3;
      var vert = y<3;
      var horz = x<4;
      for(var d=0;d<4;d++){
        diag1 = diag1 && board[x+d][y-d] == player;
        diag2 = diag2 && board[x-d][y-d] == player;
        vert = vert && board[x][y+d] == player;
        horz = horz && board[x+d][y] == player;
      }
      if(diag2 || diag1 || vert || horz) return complete(player);
    }
  }

  if(tie) return complete();
  return false;
}

function complete(player){
  switch(player){
    case 'red' :
      $("#result").html("Red Player Wins")
    case 'black' :
      $("#result").html("Black Player Wins")
    default : 
      $("#result").html("The Game Is A Tie")
  }
  return true;
}

function computer_turn(){

}

$(document).ready(function() {



    $('button').click(function(e) {
      if(waiting || gameover) return;
      waiting = true;
      var col = $(this).closest('tr').find('td').index($(this).closest('td'));
      var row;

      if(!board[col][5]){
        for(row=0;row<6;row++){
          if(!board[col][row]){
            add_at(col,row,'red');
            break;
          }
        }
      }else{
        waiting = false;
        return;
      }

      gameover = check_winner(col,row,'red');
      computer_turn();
      gameover = check_winner(col,row,'black');
      waiting = false;
    });
});
