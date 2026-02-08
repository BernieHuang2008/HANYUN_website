from datetime import datetime, timezone, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import json
import random
import os
import MercurySQL as msql
import libsql

# load .env.local for dev
if os.path.exists("backend/.env.local"):
    load_dotenv("backend/.env.local")
url = os.getenv("TURSO_DATABASE_URL")
auth_token = os.getenv("TURSO_AUTH_TOKEN")

# init msql
class TursoDriver(msql.drivers.sqlite):
    @staticmethod
    def connect(db_name, url, auth_token):
        # Connect directly to the remote URL to avoid local file writes on Vercel
        conn = libsql.connect(url, auth_token=auth_token)
        return conn


msql.set_driver(TursoDriver)
db = msql.DataBase("hanyun.db", url=url, auth_token=auth_token)

tb_user = db["user"]
tb_content = db["content"]
tb_feedback = db["feedback"]
tb_user.struct({"id": str, "username": str, "role": str, "pwd": str}, primaryKey="id")
tb_content.struct({"id": str, "json": str}, primaryKey="id")
tb_feedback.struct(
    {"id": int, "uid": str, "suggestion": str, "time": str}, primaryKey="id", autoIncrement=True
)


def load_default_content():
    defaultc = {
        "content": {
            "banner": {
                "imageUrl": "https://picsum.photos/800/400?grayscale",
                "subtitle": "期待与你在深实相遇",
                "title": "汉韵社秋季招新火热进行中",
            },
            "resources": [{"url": "#", "title": "汉服形制发展史 (PDF)"}],
            "tools": [
                {"url": "/tools/calendar", "title": "活动日历查询"},
                {"url": "/tools/rent", "title": "服装借用系统"},
                {"url": "/tools/checkin", "title": "社员签到入口"},
                {"url": "/ttt", "title": "ttt"},
            ],
        },
        "members": [
            {
                "name": "张三",
                "avatar": "url",
                "detail": "负责整体社团运营与管理。",
            }
        ],
    }

    for key, value in defaultc.items():
        record = tb_content.select((tb_content["id"] == key))
        if not record:
            # print(json.dumps(value))
            tb_content.insert(id=key, json=json.dumps(value))


load_default_content()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def load_content(content_id):
    record = tb_content.select((tb_content["id"] == content_id))
    if record:
        return json.loads(record[0]["json"])
    return {}


def save_content(content_id, content_data):
    json_data = json.dumps(content_data)
    tb_content.insert(__auto=True, id=content_id, json=json_data)


# API: Login
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    student_no = str(data.get("studentNo"))
    password = str(data.get("password"))

    if not student_no or not password:
        return (
            jsonify({"success": False, "message": "Please provide Student No and Password"}),
            400,
        )

    user_data = tb_user.select((tb_user["id"] == student_no))

    if len(user_data):
        # User exists, check password
        user = user_data[0]
        if user["pwd"] == password:
            return jsonify({
                "success": True, 
                "user": {
                    "id": user["id"],
                    "username": user["username"],
                    "role": user["role"]
                }
            })
        else:
             return (
                jsonify({"success": False, "message": "Invalid credentials"}),
                401,
            )
    else:
        # Create new user if not exists
        new_user = {
            "id": student_no,
            "username": "🥒",
            "role": "visitor",  # role Default: visitor
            "pwd": password
        }
        tb_user.insert(**new_user)
        return jsonify({
            "success": True, 
            "user": {
                "id": new_user["id"],
                "username": new_user["username"],
                "role": new_user["role"]
            }
        })

        
def check_is_admin():
    uid = request.cookies.get('hanyun_uid')
    token = request.cookies.get('hanyun_token')
    if not uid or not token:
        return False
    
    users = tb_user.select((tb_user['id'] == uid))
    if not users:
        return False
    
    user = users[0]
    # Check password hash (token) and role
    if user["pwd"] == token and user["role"] == 'admin':
        return True
    
    return False


# API: Get all members
@app.route("/api/members", methods=["GET"])
def get_members():
    # Load 'm' (list of {n, a, d, id})
    short_members = load_content("members")
    if not isinstance(short_members, list):
        short_members = []

    # Assign ID if missing for display
    for m in short_members:
        if "id" not in m:
            m["id"] = str(random.randint(10000, 99999))

    return jsonify(short_members)


# API: Update members
@app.route("/api/members", methods=["POST"])
def update_members():
    if not check_is_admin():
        return jsonify({"success": False, "message": "Unauthorized"}), 403
    
    data = request.json  # Data uses short keys directly
    save_content("members", data)
    return jsonify({"success": True})


# API: Get Content
@app.route("/api/content", methods=["GET"])
def get_content():
    c = load_content("content")
    if not c:
        return jsonify({"success": False, "message": "Content not found"}), 500
    return jsonify(c)


# API: Update Content
@app.route("/api/content", methods=["POST"])
def update_content():
    if not check_is_admin():
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    data = request.json
    save_content("content", data)
    return jsonify({"success": True})


# API: Suggestion Box
@app.route("/api/suggestion", methods=["POST"])
def submit_suggestion():
    data = request.json
    suggestion = data.get("suggestion")
    if not suggestion:
        return jsonify({"success": False, "message": "No suggestion provided"}), 400
    
    uid = request.cookies.get('hanyun_uid') or "Guest"
    dt = datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d %H:%M:%S")

    tb_feedback.insert(uid=uid, suggestion=suggestion, time=dt)
    return jsonify({"status": "success", "message": "感谢您的建议！"})


@app.route("/api/feedback", methods=["GET"])
def get_feedback():
    if not check_is_admin():
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    feedbacks = tb_feedback.select()
    # Ensure list format
    if not feedbacks:
        feedbacks = []
    return jsonify(feedbacks)

@app.route("/api/feedback/<int:feedback_id>", methods=["DELETE"])
def delete_feedback(feedback_id):
    if not check_is_admin():
        return jsonify({"success": False, "message": "Unauthorized"}), 403
    
    tb_feedback.delete((tb_feedback["id"] == feedback_id))
    return jsonify({"success": True})

if __name__ == "__main__":
    app.run(debug=True, port=3000)
