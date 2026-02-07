from datetime import datetime, timezone, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import json
import random
import os
import requests

load_dotenv(".env.local") # Load environment variables from .env file

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def isTrigger(trigger):
    if trigger["type"] == "date":
        return trigger["date"] == datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d")

# Helper to load data from Edge Config or local file
def load_data(key):
    edge_config = os.environ.get('EDGE_CONFIG')
    if edge_config:
        try:
             # EDGE_CONFIG is typically https://edge-config.vercel.com/<id>?token=<token>
             parts = edge_config.split('?')
             base_url = parts[0]
             query = parts[1] if len(parts) > 1 else ""
             
             # Fetch item from Edge Config
             response = requests.get(f"{base_url}/item/{key}?{query}")
             if response.ok:
                 return response.json()
             else:
                 print(f"Edge Config Error for {key}: {response.text}")
        except Exception as e:
            print(f"Failed to load {key} from Edge Config: {e}")

    # Fallback to local file
    try:
        filename = f"{key}.json"
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

# Helper to save data to Edge Config (requires VERCEL_API_TOKEN) and local file
def save_data(key, data):
    # 1. Update Edge Config if configured
    edge_config = os.environ.get('EDGE_CONFIG')
    vercel_token = os.environ.get('VERCEL_API_TOKEN')
    
    if edge_config and vercel_token:
        try:
            # Extract Edge Config ID from connection string
            # Format: https://edge-config.vercel.com/<id>?token=<token>
            if 'edge-config.vercel.com/' in edge_config:
                parts = edge_config.split('edge-config.vercel.com/')[1].split('?')
                ec_id = parts[0]
                
                url = f"https://api.vercel.com/v1/edge-config/{ec_id}/items"
                headers = {
                    "Authorization": f"Bearer {vercel_token}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "items": [
                        {
                            "operation": "upsert",
                            "key": key,
                            "value": data
                        }
                    ]
                }
                resp = requests.patch(url, headers=headers, json=payload)
                if not resp.ok:
                    print(f"Error updating Edge Config: {resp.text}")
        except Exception as e:
            print(f"Exception updating Edge Config: {e}")

    # 2. Update local file (Fallback & Dev)
    try:
        filename = f"{key}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
    except Exception as e:
        print(f"Error saving local file {key}: {e}")

# API: Login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    student_no = data.get('studentNo')
    
    if not student_no:
        return jsonify({"success": False, "message": "Please provide a Student No"}), 400

    # TODO: Implement checking logic of valid student No
    # If the student number is invalid according to school rules, return error here.
    # if not is_valid_student(student_no):
    #    return jsonify({"success": False, "message": "Invalid Student No"}), 400

    # Load users
    users = load_data('users')
    
    # Find user
    user = next((u for uid, u in users.items() if uid == student_no), None)
    
    if not user:
        # Create new user if not exists
        user = {
            "n": "🥒",  # user name
            "r": "v" # role Default role: admin, member, visitor
        }
        users[student_no] = user
        save_data('users', users)

    # add information to user object
    user['id'] = student_no
    
    return jsonify({"success": True, "user": user})

# API: Get all members
@app.route('/api/members', methods=['GET'])
def get_members():
    members = load_data('members')
    return jsonify(members)

# API: Update members
@app.route('/api/members', methods=['POST'])
def update_members():
    data = request.json
    save_data('members', data)
    return jsonify({"success": True})

# API: Get Content
@app.route('/api/content', methods=['GET'])
def get_content():
    content = load_data('content')
    if not content: # Default content if file missing
        content = {
            "resources": [],
            "tools": [],
            "banner": {
                "imageUrl": "https://picsum.photos/800/400?grayscale",
                "title": "Welcome",
                "subtitle": "Club"
            }
        }
    return jsonify(content)

# API: Update Content
@app.route('/api/content', methods=['POST'])
def update_content():
    data = request.json
    save_data('content', data)
    return jsonify({"success": True})

# API: Daily Content (Quote or Image)
@app.route('/api/daily', methods=['GET'])
def get_daily():
    # Randomly decide to return a quote or an image
    # In a real app, this might come from a DB or scheduled task
    is_image = random.choice([True, False])
    
    if is_image:
        return jsonify({
            "type": "image",
            "content": "https://picsum.photos/400/300", # Placeholder image
            "description": "今日社团摄影精选"
        })
    else:
        with open('quotes.json', 'r', encoding='utf-8') as f:
            quotes_data = json.load(f)
        quotes = quotes_data.get("general", [])

        for i in range(len(quotes_data["special"])):
             if isTrigger(quotes_data["special"][i]["trigger"]):
                return jsonify(quotes_data["special"][i]["content"])

        return jsonify({
            "type": "quote",
            "content": random.choice(quotes),
            "description": "每日一句"
        })

# API: Suggestion Box
@app.route('/api/suggestion', methods=['POST'])
def submit_suggestion():
    data = request.json
    suggestion = data.get('suggestion')
    # In a real app, save this to a database
    print(f"Received suggestion: {suggestion}")
    return jsonify({"status": "success", "message": "感谢您的建议！"})

if __name__ == '__main__':
    app.run(debug=True, port=3000)
