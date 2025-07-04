#!/bin/bash
cd /home/kavia/workspace/code-generation/tamil-tune-trivia-105463-8c3b6a1b/lyritamil_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

