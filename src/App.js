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
  const [time, setTime] = useState(0); // state for the chronometer
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [missedTargets, setMissedTargets] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [username, setUsername] = useState("");
  const [displayForm, setDisplayForm] = useState(false); // Initially false
  const [leaderboard, setLeaderboard] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [newRecord, setNewRecord] = useState(null);
  const gameAreaRef = useRef(null);
  const leaderboardRef = useRef(null); // Ref for the leaderboard element
  const intervalId = useRef(null); // Ref for interval ID

  const targetLimit = 5; // Limit for missed targets

  // Function to handle clicks outside the leaderboard to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        leaderboardRef.current &&
        !leaderboardRef.current.contains(event.target)
      ) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      const timerIntervalId = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);

      return () => clearInterval(timerIntervalId);
    }
  }, [isGameStarted]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Start the game
  const handleGameStart = () => {
    setIsGameStarted(true);
    setScore(0);
    setTime(0);
    setTargets([]);
    setMissedTargets(0);
    setGameOver(false);
    setDisplayForm(false); // Reset display form state
  };

  // turn to game over
  const handleGameOver = () => {
    setGameOver(true);
    setIsGameStarted(false);
    clearInterval(intervalId.current); // Stop the interval

    // Check if the player's score qualifies for the top 15
    const currentLeaderboard = [...leaderboard, { username, score, time }];
    currentLeaderboard.sort((a, b) => b.score - a.score);
    const playerRank = currentLeaderboard.findIndex(
      (entry) => entry.username === username && entry.score === score
    );

    if (playerRank < 15) {
      setDisplayForm(true);
    } else {
      setDisplayForm(false);
    }
  };

  // To restart when click on restart button
  const handleRestart = () => {
    setScore(0);
    setTime(0);
    setTargets([]);
    setMissedTargets(0);
    setGameOver(false);
    setIsGameStarted(true);
    setIntervalDelay(1000); // Reset the interval delay to the initial value
    setDisplayForm(false); // Reset display form state
  };

  useEffect(() => {
    if (missedTargets >= targetLimit) {
      handleGameOver();
    }
  }, [missedTargets]);

  // Retrieve the value of the username
  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/results");
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error("Error fetching the leaderboard:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (username.trim() === "") {
      alert("Please enter your name.");
      return;
    }

    try {
      await fetch("http://localhost:5000/api/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          score,
          time,
        }),
      });
      setUsername("");
      setDisplayForm(false);
      await fetchLeaderboard();
      setNewRecord({ username, score, time }); // Set newRecord with username and score
      console.log("Congratulations! You have successfully posted your score!");
      setIsDropdownVisible(true);
    } catch (error) {
      console.error("Error submitting the score and username:", error);
      alert("Failed to post the score.");
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []); // Ensure leaderboard is fetched only once on component mount

  // toggle the state of the dropdown leaderboard
  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Homepage (Game not started) */}
      {!isGameStarted && !gameOver && (
        <>
          {/* Mosquito image */}
          <img
            src={mosquito}
            alt="Mosquito"
            className="w-60 z-0 mt-40 -ml-4 absolute rounded-full animate-fade-right"
          ></img>
          {/* Title */}
          <h1 className="title text-center text-9xl z-20 mb-6 text-orange-700 animate-rotate-x">
            Mosquito Killer
          </h1>
          {/* Start Button */}
          <Start onStart={handleGameStart} />
        </>
      )}
      {/* Game is started and NOT Game over */}
      {isGameStarted && !gameOver && (
        <div className="flex flex-col">
          {/* header */}
          <header className="flex flex-row justify-between">
            {/* Title */}
            <h1 className="title text-5xl text-center ml-[500px] mt-5 mb-6 pb-1 text-orange-700 animate-rotate-x">
              Mosquito Killer
            </h1>
          </header>
          {/* Game area: on click */}
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
          {/* Game info */}
          <div className=" flex flex-col game-info text-center font-futura">
            <div className="flex flex-row justify-between px-4 font-semibold">
              <div className="score">Score: {score}</div>
              <div className="timer">Temps: {formatTime(time)}</div>
              <div className="missed-targets">
                Cibles manquées: {missedTargets}/{targetLimit}
              </div>
            </div>
            <div className="mt-16 pb-1">
              <p>Créé par <a href="https://luciel53.github.io/">Lucie Leroty</a> -
              Développeuse Web Full Stack
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Game over */}
      {gameOver && (
        <div className="flex flex-col">
          <header className="flex flex-row justify-between mt-6">
            {/* Title */}
            <h1 className="title text-5xl text-center ml-[500px] mb-6 text-orange-700 animate-rotate-x">
              Mosquito Killer
            </h1>
            {/* Leaderboard */}
            <div
              className="-mr-36 relative z-20 font-futura"
              ref={leaderboardRef}
            >
              <img
                src={trophy}
                alt="Leaderboard"
                onClick={toggleDropdown}
                className="w-14 -mt-2 cursor-pointer hover:opacity-85 hover:transition-opacity"
              />
              {isDropdownVisible && (
                <div className="flex flex-col items-center absolute right-0 -mt-1 w-[980px] h-auto pt-10 pb-2 bg-winner bg-cover bg-no-repeat rounded-2xl shadow-lg z-20 text-2xl animate-fade-down border-4 border-yellow-500">
                  <h2 className="text-3xl -mt-7 mb-4 z-20 animate-pulse">
                    Top 15
                  </h2>
                  <div className="absolute inset-0 bg-slate-50 bg-opacity-70 rounded-2xl"></div>
                  <table className="z-10 w-full text-center">
                    <thead>
                      <tr>
                        <th className="py-2 px-4">#</th>
                        <th className="py-2 px-4">Nom</th>
                        <th className="py-2 px-4">Score (Moustiques tués)</th>
                        <th className="py-2 px-4">Temps</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((result, index) => (
                        <tr
                          key={result.username + index}
                          className={`${
                            newRecord &&
                            newRecord.username === result.username &&
                            newRecord.score === result.score &&
                            newRecord.time === result.time
                              ? "bg-yellow-300 font-bold"
                              : ""
                          }`}
                        >
                          <td
                            className={`py-2 px-4 ${
                              index + 1 < 4 ? "text-yellow-500 font-bold" : ""
                            }`}
                          >
                            {index + 1}
                          </td>
                          <td className="py-2 px-4">{result.username}</td>
                          <td className="py-2 px-4">{result.score}</td>
                          <td className="py-2 px-4">
                            {formatTime(result.time)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </header>
          {/* Game area */}
          <div
            className="flex flex-row justify-center items-center bg-slate-50 w-[1400px] h-[700px] rounded-2xl bg-opacity-90 relative animate-fade animate-delay-[500ms] animate-duration-1000 animate-ease-in"
            ref={gameAreaRef}
          >
            <div className="flex flex-col items-center">
              {/* Game over title */}
              <h2 className="font-bloodlust text-orange-700 text-9xl mb-6">
                GAME OVER
              </h2>
              {/* Score (Number of mosquitoes killed) */}
              <p className="text-2xl font-futura">
                Tu as tué <span className="text-red-500">{score}</span>{" "}
                moustiques!
              </p>
              {/* Time */}
              <p className="text-2xl font-futura">
                En <span className="text-red-500">{formatTime(time)}</span>
              </p>
              {/* Failed attempts */}
              <p className="text-2xl font-futura">
                Tu as raté ta cible{" "}
                <span className="text-red-500">{missedTargets}</span> fois.
              </p>
              {/* Username form */}
              {displayForm && (
                <form
                  onSubmit={handleSubmit}
                  className="font-futura animate-jump-in animate-duration-[1000ms] animate-delay-[1000ms]"
                >
                  {/* Enter username */}
                  <input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="Enter your name"
                    className="h-12 w-60 mt-10 mr-2 border-2 text-center rounded-full border-red-500"
                  ></input>
                  {/* Submit button */}
                  <button
                    type="submit"
                    value="Submit"
                    className="font-futura p-3 border-2 rounded-full bg-red-500 text-white hover:border-2 hover:border-red-500 hover:bg-slate-50 hover:text-red-500"
                  >
                    OK
                  </button>
                </form>
              )}
              {/* Restart button */}
              <img
                src={restart}
                alt="Restart"
                className="w-20 mt-10 animate-jump-in cursor-pointer hover:opacity-85 hover:transition-opacity"
                onClick={handleRestart}
              />
            </div>
          </div>
          {/* Game info */}
          <div className="game-info text-center font-futura">
            <div className="flex flex-row justify-between px-4 font-semibold">
              <div className="score">Score: {score}</div>
              <div className="timer">Temps: {formatTime(time)}</div>
              <div className="missed-targets">
                Cibles manquées: {missedTargets}/{targetLimit}
              </div>
            </div>
            <div className="mt-16 pb-1">
              Créé par <a href="https://luciel53.github.io/">Lucie Leroty</a> -
              Développeuse Web Full Stack
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
