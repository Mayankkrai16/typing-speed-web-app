# typing-speed-web-app
KeyForge is a modern typing speed test web application built with Flask and JavaScript. 
It features real-time WPM tracking, accuracy analysis, performance charts, challenges, and a clean UI.

**Tech Stack:**
- Flask (Backend)
- HTML, CSS, JavaScript
- Chart.js

**🚀 Features**
⚡ Live typing speed (WPM) calculation as you type
🎯 Accuracy tracking with visual feedback on mistakes
⏱️ Different modes:
Timed mode (15s / 30s / 60s)
Paragraph mode
📊 Performance charts using Chart.js
🏆 Simple challenge system with achievements
🌗 Dark and light theme toggle
🔊 Optional typing sound effects
📈 Saves typing history using local storage
🎮 Smooth and responsive UI interactions
🛠️ Tech Stack
Frontend: HTML, CSS, JavaScript
Backend: Python (Flask)
Libraries: Chart.js
Storage: Browser LocalStorage

**📁 Project Structure**
typing-speed-app/
│
├── app.py
├── requirements.txt
├── README.md
├── .gitignore
│
├── templates/
│   └── index.html
│
├── static/
│   ├── style.css
│   └── script.js
│
└── assets/
    └── screenshots/
    
## ▶️ How to Run Locally

Clone the repository:

```bash
git clone https://github.com/Mayankkrai16/typing-speed-web-app.git
typing-speed-web-app
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the Flask app:

```bash
python app.py
```

Open your browser and go to:

```
http://127.0.0.1:5000/
```

🎯 **Future Improvements**
👤 Add user accounts and login system
🌐 Online leaderboard
🤝 Multiplayer typing mode
📱 Better mobile responsiveness
☁️ Store data in the cloud instead of local storage
🧠 What I Learned
How to build a real-time interactive web app
Connecting frontend and backend using Flask
Using localStorage to save user data
Creating charts with Chart.js
Organizing code in a cleaner and more maintainable way

🙌 Acknowledgements
Chart.js for charts and data visualization
Google Fonts for typography
