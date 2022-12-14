const user_ID_in = document.getElementById('user_id_in');
const username_in = document.getElementById('username_in');
const password_in = document.getElementById('password_in');
const username = document.getElementById('username');

const message = document.getElementById('chat_entered');
const global_message = document.getElementById('global_chat');

const game_ID_input = document.getElementById('game_ID_input')
const game_ID = document.getElementById('game_ID')

var play_as = null;

// unique id generation
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

function login(){
    socket.emit('login',{user_ID:user_ID_in.value,password:password_in.value})
}

socket.on('logged in', (data) =>{
    username.innerHTML = data.username
    var popup = document.getElementById("login_account_popup");
    popup.classList.toggle("show");
    
    console.log('logged in')
    console.log(username)
})

function join_game(play_as){
    game_ID.innerHTML = game_ID_input.value
    socket.emit('join_game',{game_ID:game_ID.innerHTML,join_as:play_as})
}


socket.on('joined as', (data) => {
    var popup = document.getElementById("player_selection_popup");
    popup.classList.toggle("show");
    play_as = data.join_as

    //TODO implement board rotation when playing as black
    console.log(data.join_as)
})

function send_message(){
    socket.emit('new_message',{game_ID:game_ID.innerHTML,message:message.value})
}

// server returns the entire chat room history upon recieve new messages
socket.on('update_chat', (data) => {
    global_message.value = data.chat;
})

function ai_join(){
    game_ID.innerHTML = game_ID_input.value
    socket.emit('add_stockfish_ai',{game_ID:game_ID.innerHTML,join_as:play_as})
}