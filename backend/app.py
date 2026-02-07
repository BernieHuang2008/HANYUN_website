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
    # s: trigger, t: type, d: date
    if trigger["t"] == "date":
        return trigger["d"] == datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d")

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

    # Fallback to local 'edgeconfig.json' simulation
    try:
        with open('edgeconfig.json', 'r', encoding='utf-8') as f:
            all_data = json.load(f)
            # KEY MAPPINGS (for local dev fallback, assuming JSON has short keys)
            # u: users, c: content, q: quotes, m: members
            return all_data.get(key, [] if key == 'm' else {}) 
    except FileNotFoundError:
        return [] if key == 'm' else {}

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

    # 2. Update local 'edgeconfig.json' simulation (Fallback & Dev)
    try:
        filename = 'edgeconfig.json'
        all_data = {}
        if os.path.exists(filename):
            with open(filename, 'r', encoding='utf-8') as f:
                try:
                    all_data = json.load(f)
                except json.JSONDecodeError:
                    all_data = {}
        
        all_data[key] = data
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=4)
    except Exception as e:
        print(f"Error saving local file {key}: {e}")

# API: Login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    student_no = data.get('studentNo')
    
    if not student_no:
        return jsonify({"success": False, "message": "Please provide a Student No"}), 400

    # Load users (short key 'u')
    users = load_data('u')
    
    # Find user by student number (key in users dict)
    user_data = users.get(student_no)
    
    if not user_data:
        # Create new user if not exists
        user_data = {
            "n": "🥒",  # user name default
            "r": "v"    # role Default: visitor
        }
        users[student_no] = user_data
        save_data('u', users)

    # Return user object with short keys directly
    user = {
        "id": student_no,
        "n": user_data.get("n"),
        "r": user_data.get("r")
    }
    
    return jsonify({"success": True, "user": user})

# API: Get all members
@app.route('/api/members', methods=['GET'])
def get_members():
    # Load 'm' (list of {n, a, d, id})
    short_members = load_data('m')
    if not isinstance(short_members, list):
        short_members = []
    
    # Assign ID if missing for display
    for m in short_members:
        if "id" not in m:
            m["id"] = str(random.randint(10000, 99999))
            
    return jsonify(short_members)

# API: Update members
@app.route('/api/members', methods=['POST'])
def update_members():
    data = request.json # Data uses short keys directly
    save_data('m', data)
    return jsonify({"success": True})

# API: Get Content
@app.route('/api/content', methods=['GET'])
def get_content():
    c = load_data('c')
    if not c:
        return jsonify({
            "res": [],
            "tls": [],
            "bn": {
                "img": "https://picsum.photos/800/400?grayscale",
                "t": "Welcome",
                "st": "Club"
            }
        })
    return jsonify(c)

# API: Update Content
@app.route('/api/content', methods=['POST'])
def update_content():
    data = request.json
    save_data('c', data)
    return jsonify({"success": True})

# API: Daily Content (Quote or Image)
@app.route('/api/daily', methods=['GET'])
def get_daily():
    q = load_data('q') # Contains g (general) and s (special)
    
    # Check Special Triggers
    special_list = q.get("s", [])
    for item in special_list:
        if isTrigger(item.get("tr", {})):
            content = item.get("c", {})
            return jsonify({
                "t": content.get("t"), # type
                "c": content.get("c"), # content
                "d": content.get("d")  # description
            })

    # General Random Quote
    general_quotes = q.get("g", [])
    if general_quotes:
        quote = random.choice(general_quotes)
        return jsonify({
            "t": "quote",
            "c": quote,
            "d": "每日一句"
        })
    
    return jsonify({
        "t": "quote",
        "c": "Stay inspired!",
        "d": "Daily Quote"
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
