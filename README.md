# ai_story_dashboard
🎬 Drama Production & Planning Management System

AI-based Urdu Script Breakdown + Shooting Schedule Automation

یہ سسٹم ڈرامہ پروڈکشن کمپنیوں کے لیے بنایا گیا ہے جس کا مقصد پوری اسکرپٹ کو آٹومیٹکلی breakdown کرنا، پروڈکشن پلاننگ کو آسان بنانا، اور شوٹنگ شیڈول کو صحیح ترتیب سے منظم کرنا ہے۔

🚀 Features (Currently Completed)
1. Auto Urdu Script Breakdown

اس فیچر سے سسٹم مکمل اسکرپٹ سے خود بخود نکالتا ہے:

Episode No

Scene No

Scene Time

Characters Appearing

Location

Sub-Location

Props

Synopsis

Phone Talk

Scheduled Date

Recording Date

2. Shooting Schedule Management

Scene کو Day-wise اور Date-wise خودکار شیڈول کرتا ہے

پورا پلان MongoDB میں Save ہوتا ہے

3. Database

MongoDB connected

All breakdown + schedule data auto-save

🛠 Tech Stack

Frontend: React / Next.js (جو آپ نے use کیا ہے)

Backend: Node.js / Express

Database: MongoDB

AI / NLP: Urdu Script Parsing + Auto Breakdown Logic

📌 Upcoming Features (Next Requirements)
🔹 1. Characters Summary

ہر کردار کا مکمل خلاصہ:

کتنے سین

کتنے دن

کتنی شوٹنگ

کتنی Availability required

🔹 2. Location Summary

کون سا location کتنے scenes میں ہے

کتنے shoot days required

🔹 3. Sub-Location Summary

Room wise / Area wise استعمال کا complete breakdown

🔹 4. Props Summary

کون سا prop کتنے scenes میں

Availability list

Shopping / Rental list

🔹 5. Day & Night Scene Summary

پورے ڈرامہ میں کتنے دن کے scene

کتنے رات کے scenes

🔹 6. Drama Characters → Original Artists Mapping

Actors details

Availability

Cost per day

Scenes mapping

🔹 7. Auto-Generated Shooting Plan (Low-Cost Smart Planner)

Artificial Intelligence based plan:

Low cost shooting

Artists available dates 

Location wise bundle shooting

Fastest schedule
📂 Folder Structure
ai_story_dashboard/
│
├── client/          # React Frontend
│   ├── components/
│   ├── pages/
│   ├── utils/
│   └── styles/
│
├── server/          # Node.js Backend
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── server.js
│
└── README.md
🧪 How to Run Locally
Backend
cd server
npm install
npm start

Frontend
cd client
npm install
npm start


Make sure to set your MongoDB URI inside .env.

📅 Roadmap

✔ Urdu Script Auto Breakdown

✔ Basic Shooting Scheduler

✔ MongoDB save

⏳ Character Summary

⏳ Location Summary

⏳ Prop Summary

⏳ Artist Mapping Module

⏳ AI Based Smart Shooting Planner

⏳ Export PDF / Excel Files

⏳ Admin Panel + User Roles

👤 Author

محمد علی (S.M. Ali Zaidi)
Drama Production Automation Developer
