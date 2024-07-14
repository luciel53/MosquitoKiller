import React, { useState, useEffect, useRef } from "react";
import Start from "./components/Start";
import "./App.css";
import mosquito from "./cute-mosquito-cartoon-character-flying/vvxs_w2ro_230518.jpg";
import trophy from "./images/trophy.svg";
import restart from "./images/restart.svg";

function App() {
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const [intervalDelay, setIntervalDelay] = useState(1000); // Initial delay of 1 sec
  const [timeElapsed, setTimeElapsed] = useState(0); // state for the chronometer
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [missedTargets, setMissedTargets] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameAreaRef = useRef(null);
  const intervalId = useRef(null); // to store the interval id
  const timerIntervalId = useRef(null); // to store the timer interval id

  const targetLimit = 5; // Limit for missed targets

  const spawnTarget = () => {
    if (gameAreaRef.current) {
      const newTarget = {
        id: Date.now(),
        x: Math.random() * (gameAreaRef.current.offsetWidth - 50),
        y: Math.random() * (gameAreaRef.current.offsetHeight - 50),
      };
      setTargets((prevTargets) => [...prevTargets, newTarget]);
    }
  };

  const handleTargetClick = (id, event) => {
    event.stopPropagation(); // Prevent counting the click as a missed target
    setTargets((prevTargets) =>
      prevTargets.filter((target) => target.id !== id)
    );
    setScore((prevScore) => prevScore + 1);
  };

  const handleGameAreaClick = () => {
    if (!gameOver) {
      setMissedTargets((prevMissed) => prevMissed + 1);
    }
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

  // Effect to manage the interval to generate new targets
  useEffect(() => {
    if (isGameStarted && intervalId.current) {
      clearInterval(intervalId.current);
    }
    if (isGameStarted) {
      intervalId.current = setInterval(spawnTarget, intervalDelay);
    }

    return () => clearInterval(intervalId.current); // clean up!
  }, [intervalDelay, isGameStarted]);

  // Effect to increase the speed every 30 sec
  useEffect(() => {
    const increaseSpeed = () => {
      setIntervalDelay((prevDelay) => Math.max(200, prevDelay - 100)); // Reduce the interval by 100ms until 200ms
    };

    if (isGameStarted) {
      const speedInterval = setInterval(increaseSpeed, 30000); // every 30 sec
      return () => clearInterval(speedInterval);
    }
  }, [isGameStarted]);

  // Effects to update chronometer every sec
  useEffect(() => {
    if (isGameStarted) {
      timerIntervalId.current = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
      }, 1000);

      return () => clearInterval(timerIntervalId.current);
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
    setGameOver(false);
  };

  const handleGameOver = () => {
    setGameOver(true);
    setIsGameStarted(false);
    clearInterval(timerIntervalId.current); // Stop the timer
  };

  const handleRestart = () => {
    setScore(0);
    setTimeElapsed(0);
    setTargets([]);
    setMissedTargets(0);
    setGameOver(false);
    setIsGameStarted(true);
    setIntervalDelay(1000); // Reset the interval delay to the initial value
  };

  useEffect(() => {
    if (missedTargets >= targetLimit) {
      handleGameOver();
    }
  }, [missedTargets]);

  return (
    <div className="flex flex-col h-full w-full">
      {!isGameStarted && !gameOver && (
        <>
          <img
            src={mosquito}
            className="w-60 z-0 mt-40 -ml-4 absolute rounded-full animate-fade-right"
          ></img>
          <h1 className="title text-center text-9xl z-20  mb-6 text-orange-700 animate-rotate-x">
            Mosquito Killer
          </h1>
          <Start onStart={handleGameStart} />
        </>
      )}
      {isGameStarted && !gameOver && (
        <div className="flex flex-col">
          <div className="flex flex-row justify-between">
            <h1 className="title text-5xl text-center ml-[500px] mb-6 text-orange-700 animate-rotate-x">
              Mosquito Killer
            </h1>
            <div className="-mr-36">
              <img src={trophy} alt="classement" className="w-10"></img>
            </div>
          </div>
          <div
            className="bg-slate-50 w-[1400px] h-[700px] rounded-2xl bg-opacity-90 relative animate-fade animate-delay-[500ms] animate-duration-1000 animate-ease-in"
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
        </div>
      )}
      {gameOver && (
        <div className="flex flex-col">
          <div className="flex flex-row justify-between">
            <h1 className="title text-5xl text-center ml-[500px] mb-6 text-orange-700 animate-rotate-x">
              Mosquito Killer
            </h1>
            <div className="-mr-36">
              <img src={trophy} alt="classement" className="w-12 cursor-pointer hover:opacity-85 hover:transition-opacity"></img>
            </div>
          </div>
          <div
            className="flex flex-row justify-center items-center bg-slate-50 w-[1400px] h-[700px] rounded-2xl bg-opacity-90 relative animate-fade animate-delay-[500ms] animate-duration-1000 animate-ease-in"
            ref={gameAreaRef}
          >
            <div className="flex flex-col items-center">
              <p className="font-bloodlust text-orange-700 text-9xl">GAME OVER</p>
              <p className="text-2xl">
                Vous avez tué <span className="text-red-500">{score}</span> moustiques!
              </p>
              <p className="text-2xl">
                En <span className="text-red-500">{formatTime(timeElapsed)}</span>
              </p>
              <p className="text-2xl">
                Vous avez manqué votre cible <span className="text-red-500">{missedTargets}</span> fois.
              </p>
              <img
                src={restart}
                alt="Rejouer"
                className="w-20 mt-10 animate-jump-in cursor-pointer hover:opacity-85 hover:transition-opacity"
                onClick={handleRestart}
              />
            </div>
          </div>
          <div className="game-info text-center">
            <div className="score">Score: {score}</div>
            <div className="timer">Temps écoulé: {formatTime(timeElapsed)}</div>
            <div className="missed-targets">
              Missed Targets: {missedTargets}/{targetLimit}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
