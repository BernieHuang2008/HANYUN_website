from datetime import datetime, timezone, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import json
import os
import hashlib
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
tb_user.struct(
    {
        "id": str,
        "username": str,
        "role": str,
        "pwd": str,
        "avatar": str,
        "bio": str,
        "created_at": str,
    },
    primaryKey="id",
)
tb_content.struct({"id": str, "json": str}, primaryKey="id")
tb_feedback.struct(
    {"id": int, "uid": str, "suggestion": str, "time": str},
    primaryKey="id",
    autoIncrement=True,
)

tb_finance = db["finance"]
tb_finance.struct(
    {"id": int, "time": str, "money": float, "people": str, "detail": str},
    primaryKey="id",
    autoIncrement=True,
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
        "member_display_ids": [],
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


def get_user_profile(user):
    username = (user.get("username") or "🥒").strip() or "🥒"
    avatar = (user.get("avatar") or "").strip()
    bio = (user.get("bio") or "").strip()
    created_at = user.get("created_at") or ""
    return {
        "id": user["id"],
        "nickname": username,
        "avatar": avatar,
        "bio": bio,
        "role": user.get("role", "visitor"),
        "createdAt": created_at,
    }


def cached_json_response(payload, max_age=300):
    body = json.dumps(payload, ensure_ascii=False, sort_keys=True)
    etag = hashlib.md5(body.encode("utf-8")).hexdigest()
    response = jsonify(payload)
    response.set_etag(etag)
    response.cache_control.public = True
    response.cache_control.max_age = max_age
    return response.make_conditional(request)


def get_all_members_sorted():
    users = tb_user.select()
    members = [get_user_profile(user) for user in users]
    members.sort(key=lambda x: x.get("createdAt") or "", reverse=True)
    return members


# API: Login
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    student_no = str(data.get("studentNo"))
    password = str(data.get("password"))

    if not student_no or not password:
        return (
            jsonify(
                {"success": False, "message": "Please provide Student No and Password"}
            ),
            400,
        )

    user_data = tb_user.select((tb_user["id"] == student_no))

    if len(user_data):
        # User exists, check password
        user = user_data[0]
        if user["pwd"] == password:
            username = (user.get("username") or "🥒").strip() or "🥒"
            return jsonify(
                {
                    "success": True,
                    "user": {
                        "id": user["id"],
                        "username": username,
                        "role": user["role"],
                        "avatar": (user.get("avatar") or "").strip(),
                        "bio": (user.get("bio") or "").strip(),
                        "createdAt": user.get("created_at") or "",
                    },
                }
            )
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
            "pwd": password,
            "avatar": "",
            "bio": "",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        tb_user.insert(**new_user)
        return jsonify(
            {
                "success": True,
                "user": {
                    "id": new_user["id"],
                    "username": new_user["username"],
                    "role": new_user["role"],
                    "avatar": new_user["avatar"],
                    "bio": new_user["bio"],
                    "createdAt": new_user["created_at"],
                },
            }
        )


def check_is_admin():
    uid = request.cookies.get("hanyun_uid")
    token = request.cookies.get("hanyun_token")
    if not uid or not token:
        return False

    users = tb_user.select((tb_user["id"] == uid))
    if not users:
        return False

    user = users[0]
    # Check password hash (token) and role
    if user["pwd"] == token and user["role"] == "admin":
        return True

    return False


# API: Get all members
@app.route("/api/members", methods=["GET"])
def get_members():
    display_ids = load_content("member_display_ids")
    if not isinstance(display_ids, list):
        display_ids = []

    all_members = get_all_members_sorted()
    member_map = {member["id"]: member for member in all_members}
    display_members = [member_map[mid] for mid in display_ids if mid in member_map]

    if not display_members:
        display_members = all_members[:9]

    return cached_json_response(display_members)


# API: Update members
@app.route("/api/members", methods=["POST"])
def update_members():
    if not check_is_admin():
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    data = request.json or {}
    member_ids = data.get("memberIds")
    if not isinstance(member_ids, list):
        return jsonify({"success": False, "message": "memberIds must be a list"}), 400

    normalized_ids = []
    seen = set()
    for uid in member_ids:
        uid = str(uid).strip()
        if uid and uid not in seen:
            normalized_ids.append(uid)
            seen.add(uid)

    save_content("member_display_ids", normalized_ids)
    return jsonify({"success": True})


@app.route("/api/members/all", methods=["GET"])
def get_all_members():
    return cached_json_response(get_all_members_sorted())


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


# API: Finance
@app.route("/api/finance", methods=["GET"])
def get_finance():
    limit = request.args.get("limit", type=int)
    all_records = tb_finance.select()
    balance = sum(r["money"] for r in all_records)
    sorted_records = sorted(all_records, key=lambda x: x["time"], reverse=True)
    
    if limit:
        records = sorted_records[:limit]
    else:
        records = sorted_records
        
    return jsonify({"balance": balance, "records": records})


@app.route("/api/finance", methods=["POST"])
def add_finance_record():
    # Helper to check admin (assuming utility or session check exists, 
    # but based on provided code, there is check_is_admin() used in update_content)
    # But wait, check_is_admin() is not defined in the snippet I saw earlier (lines 1-100).
    # It appeared in the RECENT read_file (lines 208-225). So it EXISTS.
    if not check_is_admin():
         return jsonify({"success": False, "message": "Unauthorized"}), 403

    data = request.json
    tb_finance.insert(
        time=data["time"], 
        money=float(data["money"]),
        people=data["people"],
        detail=data["detail"]
    )
    return jsonify({"success": True})


@app.route("/api/finance/<int:record_id>", methods=["PUT"])
def update_finance_record(record_id):
    if not check_is_admin():
         return jsonify({"success": False, "message": "Unauthorized"}), 403
         
    data = request.json
    tb_finance.update(
        (tb_finance["id"] == record_id),
        time=data["time"],
        money=float(data["money"]),
        people=data["people"],
        detail=data["detail"]
    )
    return jsonify({"success": True})


@app.route("/api/finance/<int:record_id>", methods=["DELETE"])
def delete_finance_record(record_id):
    if not check_is_admin():
         return jsonify({"success": False, "message": "Unauthorized"}), 403

    (tb_finance["id"] == record_id).delete()
    return jsonify({"success": True})


# API: Suggestion Box
@app.route("/api/suggestion", methods=["POST"])
def submit_suggestion():
    data = request.json
    suggestion = data.get("suggestion")
    if not suggestion:
        return jsonify({"success": False, "message": "No suggestion provided"}), 400

    uid = request.cookies.get("hanyun_uid") or "Guest"
    dt = datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d %H:%M:%S")

    tb_feedback.insert(uid=uid, suggestion=suggestion, time=dt)
    return jsonify({"status": "success", "message": "感谢您的建议！"})


@app.route("/api/feedback", methods=["GET"])
def get_feedback():
    if not check_is_admin():
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    feedbacks = tb_feedback.select()
    # Ensure list format
    if len(feedbacks) == 0:
        feedbacks = []
    else:
        feedbacks = [
            {
                "id": fb["id"],
                "uid": fb["uid"],
                "time": fb["time"],
                "suggestion": fb["suggestion"],
            }
            for fb in feedbacks
        ]
    return jsonify(feedbacks)


@app.route("/api/feedback/<int:feedback_id>", methods=["DELETE"])
def delete_feedback(feedback_id):
    if not check_is_admin():
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    (tb_feedback["id"] == feedback_id).delete()
    return jsonify({"success": True})


def check_auth():
    """Returns user dict if authenticated, else None."""
    uid = request.cookies.get("hanyun_uid")
    token = request.cookies.get("hanyun_token")
    if not uid or not token:
        return None
    users = tb_user.select((tb_user["id"] == uid))
    if not users:
        return None
    user = users[0]
    if user["pwd"] == token:
        return user
    return None


# API: Update Username
@app.route("/api/user/username", methods=["PUT"])
def update_username():
    user = check_auth()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    data = request.json
    new_username = data.get("username", "").strip()
    if not new_username:
        return jsonify({"success": False, "message": "Username cannot be empty"}), 400

    tb_user.update(tb_user["id"] == user["id"], username=new_username)
    return jsonify({"success": True, "username": new_username})


@app.route("/api/user/profile", methods=["PUT"])
def update_profile():
    user = check_auth()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    data = request.json or {}
    nickname = (data.get("nickname") or "").strip()
    avatar = (data.get("avatar") or "").strip()
    bio = (data.get("bio") or "").strip()

    if not nickname:
        return jsonify({"success": False, "message": "Nickname cannot be empty"}), 400
    if len(nickname) > 30:
        return jsonify({"success": False, "message": "Nickname is too long"}), 400
    if len(bio) > 250:
        return jsonify({"success": False, "message": "Bio must be 250 chars or fewer"}), 400

    tb_user.update(
        tb_user["id"] == user["id"],
        username=nickname,
        avatar=avatar,
        bio=bio,
    )
    return jsonify(
        {
            "success": True,
            "user": {
                "id": user["id"],
                "username": nickname,
                "role": user.get("role", "visitor"),
                "avatar": avatar,
                "bio": bio,
                "createdAt": user.get("created_at") or "",
            },
        }
    )


if __name__ == "__main__":
    app.run(debug=True, port=3000)
