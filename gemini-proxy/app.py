import json
import os
import urllib.request
import urllib.error

# ====== 配置区 ======
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
ALLOWED_MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"]
DEFAULT_MODEL = "gemini-2.0-flash"
# ====================


def call_gemini(messages, model=None, max_tokens=300):
    if not GEMINI_API_KEY:
        return {"code": 500, "message": "未配置GEMINI_API_KEY环境变量"}

    if not model or model not in ALLOWED_MODELS:
        model = DEFAULT_MODEL

    contents = []
    system_instruction = None

    for msg in messages:
        role = msg.get("role", "")
        content = msg.get("content", "")
        if role == "system":
            system_instruction = content
        elif role == "user":
            contents.append({"role": "user", "parts": [{"text": content}]})
        elif role == "assistant":
            contents.append({"role": "model", "parts": [{"text": content}]})

    body = {
        "contents": contents,
        "generationConfig": {
            "maxOutputTokens": max_tokens,
            "temperature": 0.7,
            "topP": 0.9
        }
    }

    if system_instruction:
        body["systemInstruction"] = {"parts": [{"text": system_instruction}]}

    url = "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}".format(model, GEMINI_API_KEY)

    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            if result.get("candidates") and result["candidates"][0].get("content"):
                text = result["candidates"][0]["content"]["parts"][0].get("text", "")
                return {"code": 0, "reply": text, "model": model}
            else:
                return {"code": 500, "message": "Gemini返回格式异常", "raw": result}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8") if e.fp else ""
        return {"code": e.code, "message": "Gemini API错误: " + str(e.code), "detail": err_body}
    except Exception as e:
        return {"code": 500, "message": "请求失败: " + str(e)}


# ====== Flask应用（Web函数入口） ======
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/', methods=['POST', 'GET'])
def handle():
    if request.method == 'GET':
        return jsonify({"code": 0, "message": "gemini-proxy running"})

    try:
        data = request.get_json(force=True)
        messages = data.get("messages", [])
        model = data.get("model", DEFAULT_MODEL)
        max_tokens = data.get("max_tokens", 300)

        if not messages:
            return jsonify({"code": 400, "message": "缺少messages"})

        result = call_gemini(messages, model, max_tokens)
        return jsonify(result)

    except Exception as e:
        return jsonify({"code": 500, "message": str(e)})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9000)
