import React, { useState, useEffect, useRef } from "react";
import Start from "./components/Start";
import "./App.css";
import mosquito from "./cute-mosquito-cartoon-character-flying/vvxs_w2ro_230518.jpg";

function App() {
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const [intervalDelay, setIntervalDelay] = useState(1000); // Initial delay of 1 sec
  const [timeElapsed, setTimeElapsed] = useState(0); // state for the chronometer
  const [isGameStarted, setIsGameStarted] = useState(false); // state for game start
  const [missedTargets, setMissedTargets] = useState(0); // state for missed targets
  const gameAreaRef = useRef(null);
  const intervalId = useRef(null); // to store the interval id

  const targetLimit = 5; // Limit for missed targets

  const spawnTarget = () => {
    const newTarget = {
      id: Date.now(),
      x: Math.random() * (gameAreaRef.current.offsetWidth - 50),
      y: Math.random() * (gameAreaRef.current.offsetHeight - 50),
    };
    setTargets((prevTargets) => [...prevTargets, newTarget]);
  };

  const handleTargetClick = (id, event) => {
    event.stopPropagation(); // Prevent counting the click as a missed target
    setTargets((prevTargets) =>
      prevTargets.filter((target) => target.id !== id)
    );
    setScore((prevScore) => prevScore + 1);
  };

  const handleGameAreaClick = () => {
    setMissedTargets((prevMissed) => prevMissed + 1);
  };

  // Check if a target is missed
  useEffect(() => {
    if (targets.length > 0) {
      const checkMissedTargets = setInterval(() => {
        if (isGameStarted && targets.length > 0) {
          setMissedTargets((prevMissed) => prevMissed + 1);
          setTargets((prevTargets) => prevTargets.slice(1));
        }
      }, intervalDelay);
      return () => clearInterval(checkMissedTargets);
    }
  }, [targets, isGameStarted, intervalDelay]);

  // effect to manage the interval to generate new targets
  useEffect(() => {
    if (isGameStarted && intervalId.current) {
      clearInterval(intervalId.current);
    }
    if (isGameStarted) {
      intervalId.current = setInterval(spawnTarget, intervalDelay);
    }

    return () => clearInterval(intervalId.current); // clean up!
  }, [intervalDelay, isGameStarted]);

  // effect to increase the speed every 30 sec
  useEffect(() => {
    const increaseSpeed = () => {
      setIntervalDelay((prevDelay) => Math.max(200, prevDelay - 100)); // Reduce the interval of 100ms til 200ms
    };

    if (isGameStarted) {
      const speedInterval = setInterval(increaseSpeed, 30000); // every 30 sec
      return () => clearInterval(speedInterval);
    }
  }, [isGameStarted]);

  // Effects to update chronometer every sec
  useEffect(() => {
    if (isGameStarted) {
      const timerInterval = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
      }, 1000);

      return () => clearInterval(timerInterval);
    }
  }, [isGameStarted]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleGameStart = () => {
    setIsGameStarted(true);
    setScore(0);
    setTimeElapsed(0);
    setTargets([]);
    setMissedTargets(0);
  };

  const handleGameOver = () => {
    setIsGameStarted(false);
    alert("Game Over!");
  };

  useEffect(() => {
    if (missedTargets >= targetLimit) {
      handleGameOver();
    }
  }, [missedTargets]);

  return (
    <div className="flex flex-col h-full w-full">
      {!isGameStarted && (
        <>
          <img src={mosquito} className="w-60 z-0 mt-40 -ml-4 absolute rounded-full animate-fade-right"></img>
          <h1 className="title text-center text-9xl z-20  mb-6 text-orange-700 animate-rotate-x">
            Mosquito Killer
          </h1>
          <Start onStart={handleGameStart} />
        </>
      )}
      {isGameStarted && (
        <>
          <h1 className="title text-5xl text-center mb-6 text-orange-700 animate-rotate-x">
            Mosquito Killer
          </h1>
          <div
            className="bg-slate-50 w-[1400px] h-[700px] rounded-2xl bg-opacity-90 relative animate-fade animate-duration-1000 animate-ease-in"
            ref={gameAreaRef}
            onClick={handleGameAreaClick} // Add click handler here
          >
            {targets.map((target) => (
              <img
                key={target.id}
                src={mosquito}
                alt={target.id}
                className="target non-selectable"
                style={{ left: target.x, top: target.y }}
                onClick={(event) => handleTargetClick(target.id, event)}
              />
            ))}
          </div>
          <div className="game-info text-center">
            <div className="score">Score: {score}</div>
            <div className="timer">Temps écoulé: {formatTime(timeElapsed)}</div>
            <div className="missed-targets">
              Missed Targets: {missedTargets}/{targetLimit}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
