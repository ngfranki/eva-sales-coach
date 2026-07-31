#!/bin/bash
cd "$HOME/eva-sales-coach"
lsof -i:8931 >/dev/null 2>&1 || (nohup python3 -m http.server 8931 >/dev/null 2>&1 & sleep 0.5)
open "http://localhost:8931"
