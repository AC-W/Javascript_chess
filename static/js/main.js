// Create Game state
game = new chess();

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

socket.on('update_move_check', (data) =>{
    if (data.validmove.length != 0){
    game.clear()
    let canPromote = false
        for(var i = 0; i < data.validmove.length;i++){
            var move = game.uci_to_move(data.validmove[i])
            if (!canPromote){
                try{
                    if (data.validmove[i][4] == 'q'){
                        game.board[move[0][0]][move[0][1]].canPromote = true
                        canPromote = true
                        console.log(game.board[move[0][0]][move[0][1]])
                    }
                    else if (data.validmove[i][4] == 'r'){
                        game.board[move[0][0]][move[0][1]].canPromote = true
                        canPromote = true
                    }
                    else if (data.validmove[i][4] == 'b'){
                        game.board[move[0][0]][move[0][1]].canPromote = true
                        canPromote = true
                    }
                    else if (data.validmove[i][4] == 'n'){
                        game.board[move[0][0]][move[0][1]].canPromote = true
                        canPromote = true
                    }
                }
                catch(err){
                    console.log('no Promotion')
                }
            }
            game.board[move[1][0]][move[1][1]].highlight = true
        }
        if (canPromote && !promotion_selection){
            if (!promotion_show){
                var popup = document.getElementById("piece_selection_popup");
                popup.classList.toggle("show");
                promotion_show = true
            }
        }
        else if (!promotion_selection){
            if(promotion_show){
                var popup = document.getElementById("piece_selection_popup");
                popup.classList.toggle("show");
                promotion_show = false
            }
        }
        game.draw(gpu_ctx,false)
        
    }
})

function setPromotion(key){
    promotion_selection = key
    var popup = document.getElementById("piece_selection_popup");
    popup.classList.toggle("show");
    promotion_show = false
}

socket.on('update_board', (data) => {
    game.update(data.game_array)
    game.draw(gp_ctx)
})

socket.on('update_chat', (data) => {
    global_message.value = data.chat;
})

socket.on('update_state', (data) => {
    global_message.value = data.chat;
    game.update(data.game_array)
})

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
    if (last_highlighted[0] == null || last_highlighted[1] == null || game.board[last_highlighted[0]][last_highlighted[1]].name === "blank"){
        return
    }
    if (play_as == 'spectate' || game.board[last_highlighted[0]][last_highlighted[1]].color != play_as ){
        return
    }
    picked_up = [last_highlighted[0],last_highlighted[1]]
    selected = [last_highlighted[0],last_highlighted[1]]
    var uci = game.dic[selected[0]]
    uci = uci.concat(8-selected[1])
    socket.emit('check_move_piece',{game_ID:game_ID.innerHTML,uci:uci})
    
});

document.addEventListener('mouseup', (event) => {
    if (last_highlighted[0] == picked_up[0] && last_highlighted[1] == picked_up[1] || (picked_up[0] == null || picked_up[1] == null)){
        picked_up = [null,null]
        return
    }
    var uci = game.move_to_uci(picked_up,last_highlighted)
    if (game.board[picked_up[0]][picked_up[1]].canPromote){
        uci = uci + promotion_selection
        promotion_selection = null
    }
    console.log(uci)
    socket.emit('check_move',{game_ID:game_ID.innerHTML,uci:uci})
    game.draw(gpu_ctx,false)
});

const reset = document.getElementById('restart');

reset.addEventListener("click", ()=>{
    console.log('reset')
    // let xhr = new XMLHttpRequest();
    // formData = new FormData();
    // formData.append('gameID',game_ID.innerHTML);
    // xhr.open('post',requestURL+'/reset',true)
    // xhr.onload = function () {
    //     var data = JSON.parse(this.response)
    //     if (xhr.status >= 200 && xhr.status < 400) {
    //         if (data.valid == 1){
    //             game.update(data.array)
    //         }
    //         picked_up = [null,null]
    //         game.draw(gp_ctx)
    //         game.draw(gpu_ctx,false)
    //     } else {
    //       console.log('error')
    //     }
    // }
    // xhr.send(formData)
})

function find_closest_block(x,y){
    b1 = Math.floor(x / block_size)
    b2 = Math.floor(y / block_size)
    return [b1,b2]
}
