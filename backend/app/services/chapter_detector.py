from app.services.ai_service import AIService
from app.prompts.system_prompt import SYSTEM_PROMPT
from app.prompts.chapter_detection_prompt import CHAPTER_DETECTION_PROMPT


class ChapterDetector:
    def __init__(self):
        self.ai = AIService()

    async def detect(self, content: str, ai_setting) -> list:
        system = "أنت مساعد أكاديمي. مهمتك تحديد الفصول والوحدات في النصوص الأكاديمية."
        prompt = CHAPTER_DETECTION_PROMPT.format(content=content[:6000])
        result = await self.ai.generate(ai_setting, system, prompt)
        if result["success"]:
            return result["data"].get("chapters", [])
        return []
