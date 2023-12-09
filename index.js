import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3001;

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

let totalCorrect = 0;

let quiz = [
  { name: "France", flag: "🇫🇷" },
  { name: "United Kingdom", flag: "🇬🇧" },
  { name: "United States of America", flag: "🇺🇸" },
];

// Use bodyParser middleware to parse JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

db.query("SELECT * FROM flags", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else {
    quiz = res.rows;
  }
  db.end();
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};

// GET home page
app.get("/", (req, res) => {
  totalCorrect = 0;
  nextQuestion();
  console.log(currentQuestion);
  res.sendFile("index.html", { root: "frontend/dist" });
});

app.post("/api/submit", (req, res) => {
  // Check if req.body or req.body.answer is undefined or null
  if (!req.body || req.body.answer == null) {
    console.error("Error: req.body or req.body.answer is undefined or null");
    return res.status(400).json({ error: "Invalid request body" });
  }

  let answer = req.body.answer.trim();
  let isCorrect = false;
  if (currentQuestion.name.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  }

  // Send the response to the frontend
  res.json({
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
    correctAnswer: currentQuestion.name,
  });

  // Get the next question
  nextQuestion();
});

// Restart the game
app.post("/api/restartGame", (req, res) => {
  totalCorrect = 0;

  nextQuestion();
  res.json({ message: "Game restarted successfully!" });
});

function nextQuestion() {
  if (quiz.length > 0) {
    const randomIndex = Math.floor(Math.random() * quiz.length);
    currentQuestion = quiz[randomIndex]; // Assign the object directly
    quiz.splice(randomIndex, 1);
  } else {
    // Reset quiz if it's empty
    console.log("Quiz is empty. Resetting...");
    quiz = [...originalQuiz];
    nextQuestion();
  }
  return currentQuestion;
}

app.get("/api/nextQuestion", (req, res) => {
  // Your logic to get the next question
  const randomFlag = nextQuestion();
  console.log(randomFlag);
  res.json(randomFlag);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
