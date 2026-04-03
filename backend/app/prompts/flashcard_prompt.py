FLASHCARD_PROMPT = """أنشئ 15 بطاقة مراجعة من هذا المحتوى.
كل بطاقة تحتوي على سؤال واضح وإجابة موجزة.
ركّز على المفاهيم الأساسية والمصطلحات المهمة.
نوّع في مستوى الصعوبة.

أرجع النتيجة بصيغة JSON فقط:
{{
    "flashcards": [
        {{"id": "1", "question": "...", "answer": "...", "difficulty": "easy|medium|hard"}},
        {{"id": "2", "question": "...", "answer": "...", "difficulty": "easy|medium|hard"}}
    ]
}}

المحتوى:
{content}"""
