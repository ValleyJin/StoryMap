from flask import Flask, request, jsonify
from database import save_story_to_firestore
from auth import verify_github_user

app = Flask(__name__)

# end point 정의 : /api/upload_story 
@app.route('/api/upload_story', methods=['POST'])
def upload_story():
    """
    StoryMap_Client에서 전송한 데이터를 받아 Firestore에 저장.
    GitHub 사용자 인증을 통해 올바른 사용자만 데이터를 업로드할 수 있도록 검증.
    """
    data = request.json

    # 데이터 검증
    if not all(k in data for k in ("title", "owner", "chapters")):
        return jsonify({"error": "Missing required fields"}), 400

    # GitHub 사용자 인증
    if not verify_github_user(data["owner"]):
        return jsonify({"error": "Unauthorized user"}), 403

    # Firestore에 저장
    success = save_story_to_firestore(data["title"], data["owner"], data["chapters"])
    
    if success:
        return jsonify({"message": "Story successfully uploaded"}), 200
    else:
        return jsonify({"error": "Failed to save story"}), 500

# 다른 API 엔드포인트들도 여기에 추가될 수 있음 