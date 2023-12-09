import React, { useState, useEffect } from "react";
import axios from "axios";
import { TotalScore } from "./TotalScore";
import styled from "styled-components";

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ccc; /* Set the background color to gray */
`;

const Form = styled.form`
  margin-top: 20px;
  padding: 20px;
  background-color: #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const AnswerInput = styled.input`
  padding: 10px;
  margin-bottom: 10px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const SubmitButton = styled.button`
  background-color: #3498db;
  color: #fff;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const GameOverContainer = styled.div`
  margin-top: 20px;
`;

const RestartButton = styled.button`
  background-color: #2ecc71;
  color: #fff;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
`;

const App = () => {
  const [totalScore, setTotalScore] = useState(0);
  const [wasCorrect, setWasCorrect] = useState(null);
  const [question, setQuestion] = useState({ flag: "" });
  const [answer, setAnswer] = useState("");
  const [gameOver, setGameOver] = useState(false);

  // Updated baseURL to match the proxy configuration
  const baseURL = "http://localhost:3001/api";

  useEffect(() => {
    // Fetch initial question when the component mounts
    fetchNextQuestion();
  }, []); // Empty dependency array to run the effect only once

  const fetchNextQuestion = () => {
    // Reset wasCorrect and game state when fetching the next question
    setWasCorrect(null);
    setGameOver(false);

    // Fetch a new question from the server
    axios
      .get(`${baseURL}/nextQuestion`)
      .then((response) => {
        console.log(response.data);
        setQuestion(response.data);
      })
      .catch((error) => {
        console.error("Error fetching next question:", error);
      });
  };

  const restartGame = () => {
    // Make a POST request to restart the game
    axios
      .post(`${baseURL}/restartGame`)
      .then((response) => {
        console.log(response.data);
        // Reset the totalScore and fetch the next question
        setTotalScore(0);
        fetchNextQuestion();
      })
      .catch((error) => {
        console.error("Error restarting game:", error);
      });
  };

  const submitForm = (e) => {
    e.preventDefault();

    // Disable form submission if the game is over
    if (gameOver) {
      return;
    }

    // Submit the user's answer to the server
    axios
      .post(`${baseURL}/submit`, { answer })
      .then((response) => {
        const { wasCorrect, totalScore } = response.data;
        setWasCorrect(wasCorrect);
        if (wasCorrect) {
          setTotalScore(totalScore);
          // Fetch the next question only if the answer is correct
          fetchNextQuestion();
          // Reset the answer when the answer is correct
          setAnswer("");
        } else {
          // Display game over message if the answer is incorrect
          setTotalScore(0); // Reset the totalScore
          setAnswer(""); // Reset the answer
          setGameOver(true); // Set game over state
        }
      })
      .catch((error) => {
        console.error("Error submitting answer:", error);
      });
  };

  return (
    <Container>
      <TotalScore totalScore={totalScore} />
      {gameOver ? (
        <GameOverContainer>
          <p>Game over! Final best score: {totalScore}</p>
          <RestartButton onClick={restartGame}>Restart</RestartButton>
        </GameOverContainer>
      ) : (
        <Form onSubmit={submitForm}>
          <h1>{question.flag}</h1>
          <AnswerInput
            type="text"
            name="answer"
            id="userInput"
            placeholder="Name the country"
            autoFocus
            autoComplete="off"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <SubmitButton type="submit">SUBMIT</SubmitButton>
        </Form>
      )}
    </Container>
  );
};

export default App;
