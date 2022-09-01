const user_ID_in = document.getElementById('user_id_in');
const username_in = document.getElementById('username_in');
const password_in = document.getElementById('password_in');
const username = document.getElementById('username');

const message = document.getElementById('chat_entered');
const global_message = document.getElementById('global_chat');

const game_ID_input = document.getElementById('game_ID_input')
const game_ID = document.getElementById('game_ID')

var play_as = null;

function uid() {
    return (performance.now().toString(36)+Math.random().toString(36)).replace(/\./g,"");
};

function generatekey(){
    console.log("generating new ID")
    game_ID_input.value = uid()
}

function create_account(){
    console.log("creating new account")
    socket.emit('create_account',{new_user_ID:user_ID_in.value,new_username:username_in.value,password:password_in.value})
}

socket.on('account_creation_success',(data)=>{
    var popup = document.getElementById("create_account_popup");
    popup.classList.toggle("show");
})

socket.on('logged in', (data) =>{
    username.innerHTML = data.username
    var popup = document.getElementById("login_account_popup");
    popup.classList.toggle("show");
    
    console.log('logged in')
    console.log(username)
})

function login(){
    socket.emit('login',{user_ID:user_ID_in.value,password:password_in.value})
}

function reload(){
    console.log('reset')
    // let xhr = new XMLHttpRequest();
    // formData = new FormData();
    // formData.append('gameID',secret_key.value);
    
    // xhr.open('POST',requestURL+'/reset',true)
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
    //     console.log('error')
    //     }
    // }
    // xhr.send(formData)
}

socket.on('joined as', (data) => {
    var popup = document.getElementById("player_selection_popup");
    popup.classList.toggle("show");
    play_as = data.join_as
    console.log(data.join_as)
})

function join_game(play_as){
    game_ID.innerHTML = game_ID_input.value

    socket.emit('join_game',{game_ID:game_ID.innerHTML,join_as:play_as})
}

function send_message(){
    socket.emit('new_message',{game_ID:game_ID.innerHTML,message:message.value})
}

function ai_join(){
    game_ID.innerHTML = game_ID_input.value
    socket.emit('add_stockfish_ai',{game_ID:game_ID.innerHTML,join_as:play_as})
}