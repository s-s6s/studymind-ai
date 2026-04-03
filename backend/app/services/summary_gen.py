from app.services.ai_service import AIService
from app.prompts.system_prompt import SYSTEM_PROMPT
from app.prompts.summary_prompt import SUMMARY_PROMPT


class SummaryGenerator:
    def __init__(self, ai_service: AIService):
        self.ai = ai_service

    async def generate(self, content: str, ai_setting, detail_level: str, language: str,
                       subject_name: str, chapter_title: str) -> dict:
        system = SYSTEM_PROMPT.format(
            language=language, subject_name=subject_name, chapter_title=chapter_title
        )
        prompt = SUMMARY_PROMPT.format(
            detail_level=detail_level,
            content=content[:8000]
        )
        return await self.ai.generate(ai_setting, system, prompt)
