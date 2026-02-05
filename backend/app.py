from datetime import datetime, timezone, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import random
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def isTrigger(trigger):
    if trigger["type"] == "date":
        return trigger["date"] == datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d")

# Helper to load members
def load_members():
    try:
        with open('members.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

# API: Get all members
@app.route('/api/members', methods=['GET'])
def get_members():
    members = load_members()
    return jsonify(members)

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
    app.run(debug=True, port=5000)
