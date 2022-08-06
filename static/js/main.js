// Create Game state
game = new chess();
var socket = null
$(document).ready(function(){
    socket = io.connect('http://127.0.0.1:5000/');
    socket.on('connect', function(){
        socket.send('User has connected');
    });
    socket.on('validmove', function(data) {
        if (data.valid == 1){
            game.update(data.array)
        }
        picked_up = [null,null]
        game.draw(gp_ctx)
        game.draw(gpu_ctx,false)
    });

    $('#restart').on('click',function(){
        socket.send('restarting...');
    });

    socket.on('validmove_piece',function(data){
        if (data.validmove.length != 0){
            console.log(data.validmove)
            for(var i = 0; i < data.validmove.length;i++){
                move = game.uci_to_move(data.validmove[i])
                console.log(move)
                game.board[move[1][0]][move[1][1]].highlight = true
            }
        }
        game.draw(gpu_ctx,false)
        game.clear()
    });
});

// Create Game board
const game_board = document.getElementById('game_board');
const gb_ctx =  game_board.getContext('2d');

const game_pieces = document.getElementById('game_pieces');
const gp_ctx =  game_pieces.getContext('2d');

const game_pieces_up = document.getElementById('game_pieces_up');
const gpu_ctx =  game_pieces_up.getContext('2d');

game_board.width = 800;
game_board.height = 800;

game_pieces.width = game_board.width;
game_pieces.height = game_board.height;

game_pieces_up.width = game_board.width;
game_pieces_up.height = game_board.height;

block_size = game_board.width/8;
block_size = game_board.height/8;

last_highlighted = [null,null]
picked_up = [null,null]
selected = [null,null]

background_color1 = 'rgb(222, 128, 35)';
background_color2 = 'rgb(255, 163, 71)';
for (var x = 0; x <= 8;x++){
    for(var i = 0;i <= 8; i++){
        if (i % 2 == x % 2){
            gb_ctx.beginPath();
            gb_ctx.rect(i*block_size,x*block_size,block_size,block_size);
            gb_ctx.fillStyle = background_color1;
            gb_ctx.fill();
        }
        else{
            gb_ctx.beginPath();
            gb_ctx.rect(i*block_size,x*block_size,block_size,block_size);
            gb_ctx.fillStyle = background_color2;
            gb_ctx.fill();
        }
    }
}

game.draw(gp_ctx)

// Compute where player click on screen
document.addEventListener('mousemove', (event) => {
	mouse_loc_x = event.clientX - game_board.getBoundingClientRect().left;
    mouse_loc_y = event.clientY - game_board.getBoundingClientRect().top;
    if (mouse_loc_x > game_board.width || mouse_loc_x < 0 || mouse_loc_y > game_board.height || mouse_loc_y < 0){
        return
    }
    loc = find_closest_block(mouse_loc_x,mouse_loc_y)
    if(last_highlighted[0] != loc[0] || last_highlighted[1] != loc[1]){
        object_clicked = game.board[loc[0]][loc[1]];
        if(last_highlighted[0] != null && last_highlighted[1] != null){
            game.board[last_highlighted[0]][last_highlighted[1]].highlight = false
            game.board[loc[0]][loc[1]].highlight = true
            last_highlighted[0] = loc[0]
            last_highlighted[1] = loc[1]
            game.draw(gp_ctx)
        }
        else{
            last_highlighted[0] = loc[0]
            last_highlighted[1] = loc[1]
            game.draw(gp_ctx)
        }
    }
});

document.addEventListener('mousedown', (event) => {
    if (game.board[last_highlighted[0]][last_highlighted[1]].name === "blank"){
        return
    }
    picked_up = [last_highlighted[0],last_highlighted[1]]
    selected = [last_highlighted[0],last_highlighted[1]]
    let uci = game.dic[selected[0]]
    uci = uci.concat(8-selected[1])
    socket.emit('check_move_piece',uci)
});

document.addEventListener('mouseup', (event) => {
    if (last_highlighted[0] == picked_up[0] && last_highlighted[1] == picked_up[1] || (picked_up[0] == null || picked_up[1] == null)){
        picked_up = [null,null]
        return
    }
    uci = game.move_to_uci(picked_up,last_highlighted)
    socket.emit('check_move',uci)    
});

function find_closest_block(x,y){
    b1 = Math.floor(x / block_size)
    b2 = Math.floor(y / block_size)
    return [b1,b2]
}

function animate(){
    requestAnimationFrame(animate);
}

animate();
