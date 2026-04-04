CHAPTER_DETECTION_PROMPT = """هذا نص من مستند أكاديمي. حدد الفصول أو الوحدات الرئيسية.

أرجع النتيجة بصيغة JSON فقط:
{{
    "chapters": [
        {{
            "title": "عنوان الفصل",
            "start_marker": "أول جملة من الفصل",
            "estimated_pages": 5
        }}
    ]
}}

النص:
{content}"""
