export const TotalScore = ({ totalScore }) => {
  return (
    <div className="horizontal-container">
      <h3>
        Total Score: <span id="score">{totalScore}</span>
      </h3>
    </div>
  );
};
