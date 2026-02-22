from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
# Allow cross-origin requests for decoupled hosting
CORS(app)

# =====================================================================
# DATA ACCESS LAYER (OOP & DRY Principle)
# =====================================================================
class FeedbackManager:
    """Handles all data persistence to isolate database logic from API routes."""
    def __init__(self, filepath):
        self.filepath = filepath
        self._ensure_file_exists()

    def _ensure_file_exists(self):
        """Creates the directory and file if they do not exist to prevent FileNotFoundError."""
        os.makedirs(os.path.dirname(self.filepath), exist_ok=True)
        if not os.path.exists(self.filepath):
            self._write_data([])

    def _read_data(self):
        """Safely reads the JSON file."""
        try:
            with open(self.filepath, 'r', encoding='utf-8') as file:
                return json.load(file)
        except (json.JSONDecodeError, IOError):
            return []

    def _write_data(self, data):
        """Safely writes to the JSON file."""
        with open(self.filepath, 'w', encoding='utf-8') as file:
            json.dump(data, file, indent=4)

    def save_entry(self, entry):
        """Appends a new entry with an auto-generated timestamp."""
        data = self._read_data()
        entry['timestamp'] = datetime.now().isoformat()
        data.append(entry)
        self._write_data(data)
        return True

# Initialize the Data Manager
feedback_db = FeedbackManager(os.path.join('static', 'docs', 'feedback.json'))


# =====================================================================
# CONTROLLERS / PAGE ROUTES
# =====================================================================
@app.route('/')
def home():
    """Serves the main Landing page."""
    return render_template('index.html')

@app.route('/pension')
def pension():
    """Serves the Economic Rights page."""
    return render_template('pension.html')

@app.route('/health')
def health():
    """Serves the Health Benefits page."""
    return render_template('health.html')

@app.route('/transport')
def transport():
    """Serves the Mobility/Transport page."""
    return render_template('transport.html')

@app.route('/legal')
def legal():
    """Serves the Legal Protection page."""
    return render_template('legal.html')


# =====================================================================
# API ENDPOINTS
# =====================================================================
@app.route('/api/v1/feedback', methods=['POST'])
def submit_feedback():
    """
    Robust API endpoint for handling form submissions.
    Includes validation and global error handling.
    """
    try:
        data = request.get_json()
        
        # 1. Validation
        if not data or not data.get('message') or not data.get('topic'):
            return jsonify({
                "status": "error", 
                "message": "Missing required fields: 'topic' and 'message'."
            }), 400

        # 2. Sanitization (Basic implementation for security)
        clean_entry = {
            "name": str(data.get('name', 'Anonymous')).strip(),
            "topic": str(data.get('topic')).strip(),
            "message": str(data.get('message')).strip()
        }

        # 3. Persistence
        feedback_db.save_entry(clean_entry)
        
        # 4. Response
        return jsonify({
            "status": "success", 
            "message": "Your query has been securely submitted."
        }), 201

    except Exception as e:
        # Prevent server crash and return generic error to client
        print(f"Server Error: {e}") # In production, use a logging library
        return jsonify({
            "status": "error", 
            "message": "An internal server error occurred. Please try again later."
        }), 500


## =====================================================================
# EXECUTION (Dynamic Port Binding & Fault Tolerance)
# =====================================================================
def get_free_port():
    """
    First-Principles approach: Asks the OS for a guaranteed free port 
    rather than hardcoding and guessing.
    """
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        # Binding to port 0 tells the OS to assign an available ephemeral port
        s.bind(('127.0.0.1', 0))
        # Retrieve the port number the OS just assigned
        return s.getsockname()[1]

if __name__ == '__main__':
    import sys
    
    # 1. Dynamically acquire a free port from the OS
    try:
        AVAILABLE_PORT = get_free_port()
    except Exception as e:
        print(f"\n❌ FATAL: Could not allocate a socket port. OS Error: {e}\n")
        sys.exit(1)
    
    print("\n" + "="*50)
    print("🚀 Booting ElderRights Portal Backend...")
    print(f"📡 Operating System assigned free port: {AVAILABLE_PORT}")
    print(f"👉 Access your website at: http://127.0.0.1:{AVAILABLE_PORT}")
    print("="*50 + "\n")

    try:
        # Execution Rules:
        # host='127.0.0.1': Strictly bind to localhost loopback.
        # port=AVAILABLE_PORT: Use the guaranteed free port.
        # debug=True: Enabled strictly for traceback logging, NOT for reloading.
        # use_reloader=False: Explicitly killed to prevent the watchdog process from crashing VS Code.
        # threaded=True: Prevents blocking IO when serving media.
        app.run(
            host='127.0.0.1', 
            port=AVAILABLE_PORT, 
            debug=True, 
            threaded=True, 
            use_reloader=False 
        )
    except Exception as e:
        print(f"\n❌ PROCESS TERMINATED: An unhandled exception killed the server loop.\nEvidence: {e}\n")
        sys.exit(1)