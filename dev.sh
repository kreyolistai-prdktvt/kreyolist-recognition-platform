#!/bin/bash
# KreyoList Dev Server Controller

PID_FILE=".dev_server.pid"
PORT=8000

# 1. Stop existing server if running
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if ps -p $PID > /dev/null; then
    echo "Stopping current dev server (PID: $PID)..."
    kill $PID
    sleep 1
  fi
  rm -f "$PID_FILE"
fi

# 2. Free port 8000 if bound by another zombie python process
PORT_PID=$(lsof -t -i:$PORT)
if [ ! -z "$PORT_PID" ]; then
  echo "Port $PORT is occupied by process $PORT_PID. Cleaning port..."
  kill -9 $PORT_PID
  sleep 1
fi

# 3. Launch server in background
echo "Launching Python HTTP server on port $PORT..."
python3 -m http.server $PORT > .dev_server.log 2>&1 &
NEW_PID=$!

# Record PID
echo $NEW_PID > "$PID_FILE"
echo "Dev server running persistently in background (PID: $NEW_PID)."
echo "Output is redirected to .dev_server.log"
echo "Browse: http://localhost:$PORT"
