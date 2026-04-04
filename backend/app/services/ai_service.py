import litellm
import json
from app.core.security import decrypt_api_key


class AIService:
    """
    Unified AI service using LiteLLM.
    The user provides their own API key — NO cost to the platform.
    """

    SUPPORTED_MODELS = {
        "anthropic": [
            "claude-sonnet-4-20250514",
            "claude-3-5-sonnet-20241022",
            "claude-3-haiku-20240307",
        ],
        "openai": [
            "gpt-4o",
            "gpt-4o-mini",
            "gpt-4-turbo",
        ],
        "google": [
            "gemini-2.0-flash",
            "gemini-1.5-pro",
            "gemini-1.5-flash",
        ]
    }

    async def generate(self, user_ai_setting, system_prompt: str, user_prompt: str) -> dict:
        try:
            api_key = decrypt_api_key(user_ai_setting.api_key_encrypted)
            model = f"{user_ai_setting.provider}/{user_ai_setting.model_name}"

            response = await litellm.acompletion(
                model=model,
                api_key=api_key,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=4000,
            )

            content = response.choices[0].message.content
            result = json.loads(content)
            return {"success": True, "data": result}

        except json.JSONDecodeError:
            raw = response.choices[0].message.content
            start = raw.find('{')
            end = raw.rfind('}') + 1
            if start != -1 and end > start:
                try:
                    result = json.loads(raw[start:end])
                    return {"success": True, "data": result}
                except Exception:
                    pass
            return {"success": False, "error": "AI returned invalid format. Please try again."}

        except litellm.AuthenticationError:
            return {"success": False, "error": "Invalid API key. Please check your AI settings."}

        except litellm.RateLimitError:
            return {"success": False, "error": "API rate limit reached. Please wait and try again."}

        except Exception as e:
            return {"success": False, "error": f"AI processing failed: {str(e)}"}

    async def test_api_key(self, provider: str, model_name: str, api_key: str) -> bool:
        try:
            response = await litellm.acompletion(
                model=f"{provider}/{model_name}",
                api_key=api_key,
                messages=[{"role": "user", "content": "Say ok"}],
                max_tokens=5,
            )
            return True
        except Exception:
            return False
