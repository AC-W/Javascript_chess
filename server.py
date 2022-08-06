import chess
from flask import Flask, render_template
from flask_socketio import SocketIO, send
import waitress

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'
socketio = SocketIO(app)

def fen_to_array(fen):
    board = fen.split(' ')[0]
    board = board.split('/')
    array = []
    for i in board:
        row = []
        for x in i:
            try:
                x = int(x)
                for y in range(x):
                    row.append('.')
            except:
                row.append(x)
        array.append(row)
    return array

game = chess.Board()
print(game)

@app.route("/")
def hello():
    return render_template("index.html")

@socketio.on('message')
def handelMessage(msg):
    game.reset()
    game_array = fen_to_array(game.fen())
    socketio.emit('validmove',{'valid':1,'array':game_array})
    print("message " + msg)
    send(msg)

@socketio.on('check_move_piece')
def check_move_piece(uci):
    array = list(game.legal_moves)
    # print(array)
    valid = []
    for i in array:
        i = str(i)
        if uci[0] == i[0] and uci[1] == i[1]:
            valid.append(i)
    socketio.emit('validmove_piece',{'validmove':valid})

@socketio.on('check_move')
def check_move(uci):
    game_array = fen_to_array(game.fen())
    if chess.Move.from_uci(uci) in game.legal_moves:
        game.push_uci(uci)
        print(game)
        game_array = fen_to_array(game.fen())
        socketio.emit('validmove',{'valid':1,'array':game_array})
    else:
        print("invalid move")
        socketio.emit('validmove',{'valid':0,'array':game_array})
    
if __name__ == "__main__":
    socketio.run(app)