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
tb_user.struct({"id": str, "username": str, "role": str}, primaryKey="id")
tb_content.struct({"id": str, "json": str}, primaryKey="id")
tb_feedback.struct(
    {"id": int, "uid": int, "suggestion": str}, primaryKey="id", autoIncrement=True
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
                "avatar": "社长",
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


def isTrigger(trigger):
    # s: trigger, t: type, d: date
    if trigger["t"] == "date":
        return trigger["d"] == datetime.now(timezone(timedelta(hours=8))).strftime(
            "%Y-%m-%d"
        )
    else:
        return False


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

    if not student_no:
        return (
            jsonify({"success": False, "message": "Please provide a Student No"}),
            400,
        )

    user_data = tb_user.select((tb_user["id"] == student_no))

    if len(user_data):
        user_data = {
            "id": student_no,
            "username": user_data[0]["username"],
            "role": user_data[0]["role"],  # role Default: visitor
        }
    else:
        # Create new user if not exists
        user_data = {
            "id": student_no,
            "username": "🥒",
            "role": "visitor",  # role Default: visitor
        }
        tb_user.insert(**user_data)

    return jsonify({"success": True, "user": user_data})


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
    data = request.json  # Data uses short keys directly
    save_content("members", data)
    return jsonify({"success": True})


# API: Get Content
@app.route("/api/content", methods=["GET"])
def get_content():
    c = load_content("content")
    if not c:
        return jsonify(
            {
                "res": [],
                "tls": [],
                "bn": {
                    "img": "https://picsum.photos/800/400?grayscale",
                    "t": "Welcome",
                    "st": "Club",
                },
            }
        )
    return jsonify(c)


# API: Update Content
@app.route("/api/content", methods=["POST"])
def update_content():
    data = request.json
    save_content("content", data)
    return jsonify({"success": True})


# API: Suggestion Box
@app.route("/api/suggestion", methods=["POST"])
def submit_suggestion():
    data = request.json
    suggestion = data.get("suggestion")
    # In a real app, save this to a database
    print(f"Received suggestion: {suggestion}")
    tb_feedback.insert({"uid": 0, "suggestion": suggestion})
    return jsonify({"status": "success", "message": "感谢您的建议！"})


@app.route("/api/hello", methods=["GET"])
def hello():
    return jsonify({"message": "Hello, World!"})

if __name__ == "__main__":
    app.run(debug=True, port=3000)
