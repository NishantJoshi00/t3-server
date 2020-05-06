from flask import Flask, request, url_for, render_template, redirect
import random
import json
app = Flask(__name__)

pages = {}

def init(page_id):
    if page_id not in pages or pages[page_id]['state'] == 'finished':
        pages[page_id] = {
            "players": [],
            "type": [],
            "movelog": [],
            "state": "waiting",
            "verdict": "unknown"
        }
        return 0
    else:
        return 1

def cleanTrash():
    for i in list(pages.keys()):
        if pages[i]['state'] == 'finished':
            del pages[i]
    

@app.route("/")
def root():
    return """
    <h1> This doesn't work like that</h1>
    <h4> Your have to use the url above and then add /newgame/{your_name} to create a new game</h4>
    <h4> Or /game/id/{your_name} to load a ongoing game </h4>
    """


@app.route("/game/<int:pid>/<string:name>", methods = ["GET", "POST"])
def game(pid, name):
    if request.method == "GET":
        rc = init(pid)
        if rc == 1:
            if len(pages[pid]['players']) == 2 and name not in pages[pid]['players']:
                return redirect(url_for('busy'))
        
        if len(pages[pid]['players']) == 1:
            if name not in pages[pid]['players']:
                pages[pid]['players'].append(name)
                if pages[pid]['type'][0] == 'O':
                    pages[pid]['type'].append('X')
                else:
                    pages[pid]['type'].append('O')
                pages[pid]['state'] = 'ongoing'
        elif len(pages[pid]['players']) == 0:
            pages[pid]['players'].append(name)
            pages[pid]['type'].append(random.choice(['X', 'O']))
        for i in range(len(pages[pid]['players'])):
            if pages[pid]['players'][i] == name:
                sign = pages[pid]['type'][i]
        return render_template('index.html', page=pid, players=pages[pid]['players'], condition=pages[pid]['state'], verdict=pages[pid]['verdict'], sign=sign)
    else:
        data = request.json
        if data == {}:
            for i in range(len(pages[pid]['players'])):
                if pages[pid]['players'][i] == name:
                    return json.dumps({**pages[pid], 'u': pages[pid]['type'][i]})
        else:
            if data['status'] == 'ongoing':
                pages[pid]['movelog'].append(data['position'])
                if len(pages[pid]['movelog']) == 9:
                    pages[pid]['state'] = 'finished'
                    pages[pid]['verdict'] = 'draw'
            else:
                pages[pid]['state'] = 'finished'
                if data['victor'] == False:
                    pages[pid]['verdict'] = 'tie'
                elif data['victor'] == 0:
                    pages[pid]['verdict'] = name
                else:
                    for i in pages[pid]['players']:
                        if i != name:
                            pages[pid]['verdict'] = i
                            break
        return ''
                    
                
@app.route("/newgame/<string:name>", methods=['GET'])
def newgame(name):
    _ = random.randint(1, 2 ** 16)
    while (_ in pages.keys()):
        _ = random.randint(1, 2 ** 16)
    return redirect(url_for('game', pid=_, name=name))

@app.route("/post", methods=['POST'])
def post():
    a = {
        'status': 'ongoing',
        'report': 'open',
        'hello': ['p1', 'p2']
    }
    return json.dumps(a)

@app.route("/busy")
def busy():
    return "<h1>Busy</h1>"

if __name__ == "__main__":
    app.run(host="0.0.0.0",port=80)
