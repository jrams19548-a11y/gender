from flask import Flask, request, jsonify, send_from_directory
import json
import os

app = Flask(__name__)

USERS_FILE = 'users.txt'
GENDERS_FILE = 'genders.txt'

def load_data(filename):
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            return json.load(f)
    return []

def save_data(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

@app.route('/users', methods=['GET', 'POST'])
def users():
    if request.method == 'GET':
        return jsonify(load_data(USERS_FILE))
    elif request.method == 'POST':
        users = load_data(USERS_FILE)
        new_user = request.json
        users.append(new_user)
        save_data(USERS_FILE, users)
        return jsonify({'status': 'success'})

@app.route('/genders', methods=['GET', 'POST'])
def genders():
    if request.method == 'GET':
        return jsonify(load_data(GENDERS_FILE))
    elif request.method == 'POST':
        genders = load_data(GENDERS_FILE)
        new_gender = request.json.get('gender')
        if new_gender not in genders:
            genders.append(new_gender)
            save_data(GENDERS_FILE, genders)
            return jsonify({'status': 'success'})
        return jsonify({'status': 'duplicate'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)