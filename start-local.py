from pathlib import Path
import os
import subprocess
import sys
import webbrowser

root=Path(__file__).resolve().parent
port=4173
subprocess.Popen([sys.executable,'-m','http.server',str(port)],cwd=root)
webbrowser.open(f'http://127.0.0.1:{port}/index.html')
print(f'Pathfinder running at http://127.0.0.1:{port}/index.html')
print('Leave this window open while using the local preview.')
input('Press Enter to stop the local server...')
