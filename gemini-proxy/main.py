# Gemini API 代理 - 腾讯云函数 SCF
# 部署方式：腾讯云控制台 → 云函数 → 从零开始 → Python 3.9 → 粘贴此代码

import json
import urllib.request
import urllib.error

# ====== 配置区 ======
GEMINI_API_KEY = "你的Gemini API Key"  # 替换成你的Key
ALLOWED_MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"]
DEFAULT_MODEL = "gemini-2.0-flash"
# ====================


def call_gemini(messages, model=None, max_tokens=300):
    """调用Gemini API"""
    if not model or model not in ALLOWED_MODELS:
        model = DEFAULT_MODEL

    # 把OpenAI格式的messages转成Gemini格式
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

    # 构建请求体
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

            # 提取回复文本
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


def main_handler(event, context):
    """腾讯云函数入口"""
    try:
        # 解析请求体
        if isinstance(event, str):
            body = json.loads(event)
        elif isinstance(event, dict):
            body = event.get("body", event)
            if isinstance(body, str):
                body = json.loads(body)
        else:
            body = {}

        messages = body.get("messages", [])
        model = body.get("model", DEFAULT_MODEL)
        max_tokens = body.get("max_tokens", 300)

        if not messages:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json; charset=utf-8"},
                "body": json.dumps({"code": 400, "message": "缺少messages"}, ensure_ascii=False)
            }

        result = call_gemini(messages, model, max_tokens)

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps(result, ensure_ascii=False)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json; charset=utf-8"},
            "body": json.dumps({"code": 500, "message": str(e)}, ensure_ascii=False)
        }
