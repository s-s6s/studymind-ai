#!/bin/bash
cd /home/user/webapp/studymind-ai/backend
export PYTHONPATH=/home/user/webapp/studymind-ai/backend
exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
