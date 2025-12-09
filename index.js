// index.js

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose(); 

const app = express();
const PORT = 5000; 

app.use(cors()); 
app.use(express.json()); 

const db = new sqlite3.Database('./ai_story_db.sqlite', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

app.get('/', (req, res) => {
  res.send('AI Story Dashboard Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});