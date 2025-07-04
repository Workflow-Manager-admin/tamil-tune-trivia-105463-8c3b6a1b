import React, { useState, useEffect, useRef } from "react";
import "./App.css";

/* Lyritamil Color Theme Constants */
const THEME_COLORS = {
  accent: "#FF4081",     // Vibrant pink
  primary: "#5D1049",    // Deep purple
  secondary: "#FFDDC1",  // Peachy tan
  lightBg: "#fff"
};

/* Demo Lyric Data */
const DEMO_QUESTIONS = [
  {
    lyric: "My heart is a galloping horse, searching for you everywhere", // English translation
    answer: "Vinnaithaandi Varuvaayaa",
    choices: [
      "Vinnaithaandi Varuvaayaa",
      "Alaipayuthey",
      "Roja",
      "Anniyan"
    ],
    hint: "Actor: Silambarasan (Simbu)",
    musicDirector: "A. R. Rahman"
  },
  {
    lyric: "Why do you look away, when I come close to talk?",
    answer: "O Kadhal Kanmani",
    choices: [
      "O Kadhal Kanmani",
      "Enai Noki Paayum Thota",
      "Thulladha Manamum Thullum",
      "Mouna Ragam"
    ],
    hint: "Music Director: A. R. Rahman",
    musicDirector: "A. R. Rahman"
  },
  {
    lyric: "My life became poetry the day I met you",
    answer: "Alaipayuthey",
    choices: [
      "Rhythm",
      "Alaipayuthey",
      "Jeans",
      "Sillunu Oru Kadhal"
    ],
    hint: "Actor: Madhavan",
    musicDirector: "A. R. Rahman"
  }
  // ... more questions could be loaded here
];

/**
 * Modes:
 *  - guess: Type the answer
 *  - choice: Multiple choice
 *  - timed: 60 seconds for as many as possible
 */
const MODES = [
  { key: "guess", label: "Guess The Song" },
  { key: "choice", label: "Multiple Choice" },
  { key: "timed", label: "60s Challenge" }
];

// PUBLIC_INTERFACE
function LyricGameApp() {
  // Core Gameplay State
  const [gameMode, setGameMode] = useState("guess");
  const [showInstructions, setShowInstructions] = useState(true);
  const [current, setCurrent] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [correct, setCorrect] = useState(null); // null/true/false
  const [answered, setAnswered] = useState(false);

  // Timed mode state
  const [timer, setTimer] = useState(60);
  const [timedActive, setTimedActive] = useState(false);
  const timerRef = useRef();

  // For responsive hint button position
  const floatingHintStyle = {
    position: "fixed",
    right: "20px",
    bottom: "70px",
    zIndex: 15,
    background: THEME_COLORS.accent,
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    fontSize: "2rem",
    width: "56px",
    height: "56px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.13)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.18s"
  };

  // Effect: Timed mode countdown
  useEffect(() => {
    if (gameMode === "timed" && timedActive && timer > 0) {
      timerRef.current = setTimeout(() => setTimer((t) => t - 1), 1000);
    }
    if (timer === 0) {
      setTimedActive(false); // Stop on zero
      setAnswered(true);
    }
    return () => clearTimeout(timerRef.current);
  }, [timer, timedActive, gameMode]);

  // Handler: Change mode
  // PUBLIC_INTERFACE
  function handleModeSelect(modeKey) {
    setGameMode(modeKey);
    setShowInstructions(false);
    setCurrent(0);
    setScore(0);
    setTimer(60);
    setTimedActive(modeKey === "timed");
    setUserInput("");
    setCorrect(null);
    setAnswered(false);
    setShowHint(false);
  }

  // Handler: Submit answer
  // PUBLIC_INTERFACE
  function handleSubmit(answer = null) {
    let userAns = userInput.trim();
    if (gameMode === "choice" && answer) userAns = answer;
    const currQ = DEMO_QUESTIONS[current];
    const isCorrect = userAns.toLowerCase() === currQ.answer.toLowerCase();
    setCorrect(isCorrect);
    if (isCorrect) setScore((s) => s + 1);
    setAnswered(true);
    if (gameMode === "timed" && isCorrect) {
      setTimeout(() => {
        handleNext();
        setShowHint(false);
        setUserInput("");
      }, 1200);
    }
  }

  // Handler: Next question
  // PUBLIC_INTERFACE
  function handleNext() {
    if (current < DEMO_QUESTIONS.length - 1) {
      setCurrent((idx) => idx + 1);
      setUserInput("");
      setShowHint(false);
      setCorrect(null);
      setAnswered(false);
    } else if (gameMode === "timed") {
      setCurrent((idx) => (idx + 1) % DEMO_QUESTIONS.length); // Rotate for timed
      setUserInput("");
      setShowHint(false);
      setCorrect(null);
      setAnswered(false);
    } else {
      // End
      setAnswered(true);
    }
  }

  // Handler: Start/restart timed mode
  // PUBLIC_INTERFACE
  function startTimedChallenge() {
    setGameMode("timed");
    setShowInstructions(false);
    setCurrent(0);
    setScore(0);
    setTimer(60);
    setTimedActive(true);
    setUserInput("");
    setCorrect(null);
    setAnswered(false);
    setShowHint(false);
  }

  // Handler: For Instructions button
  // PUBLIC_INTERFACE
  function handleShowInstructions() {
    setShowInstructions(true);
    setTimedActive(false);
  }

  // Layout: Central game container
  const cardStyle = {
    background: THEME_COLORS.secondary,
    boxShadow: "0 2px 16px #0001",
    borderRadius: "18px",
    maxWidth: 480,
    margin: "2rem auto",
    padding: "2.2rem 2rem",
    textAlign: "center",
    color: THEME_COLORS.primary,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: 360
  };

  // Mode switcher
  const modeSwitcherStyle = {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    margin: "1.2rem 0 0.8rem 0"
  };

  // Responsive: mobile container adjust
  const wrapperStyle = {
    minHeight: "100vh",
    background: THEME_COLORS.lightBg,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start"
  };

  // Score/timer bar style
  const scorebarStyle = {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: ".6rem",
    padding: "0 1.2rem 0 1.2rem",
    fontWeight: 600,
    fontSize: "1.17rem"
  };

  // Responsive font styling
  const lyricFont = {
    fontSize: "1.32rem",
    margin: "1.5rem 0 1.2rem 0",
    lineHeight: 1.5,
    color: THEME_COLORS.primary,
    fontWeight: 700
  };

  // PUBLIC_INTERFACE
  function renderGameCard() {
    const q = DEMO_QUESTIONS[current];
    if (!q) return <h3>Loading...</h3>;

    return (
      <div style={cardStyle}>
        <div style={lyricFont} data-testid="lyric">{`"${q.lyric}"`}</div>
        {(gameMode === "guess" || (gameMode === "timed" && !answered)) && (
          <form
            style={{ width: "100%" }}
            onSubmit={(e) => {
              e.preventDefault();
              if (!answered) handleSubmit();
            }}
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type movie/song name..."
              style={{
                width: "100%",
                padding: "0.9em 1em",
                fontSize: "1.08rem",
                borderRadius: "9px",
                border: `1.5px solid ${THEME_COLORS.primary}`,
                marginBottom: "1rem",
                outline: "none"
              }}
              disabled={answered || (gameMode === "timed" && !timedActive)}
              autoFocus
              aria-label="Type your answer"
            />
            <button
              type="submit"
              style={{
                background: THEME_COLORS.accent,
                color: "#fff",
                padding: ".7em 2.1em",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: answered ? "not-allowed" : "pointer",
                marginTop: "0.3em"
              }}
              disabled={answered || (gameMode === "timed" && !timedActive)}
            >
              Submit
            </button>
          </form>
        )}

        {gameMode === "choice" && (
          <div style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: ".75em",
            margin: "1em 0"
          }}>
            {q.choices.map((opt, idx) => (
              <button
                key={opt}
                style={{
                  background: answered
                    ? (opt === q.answer
                      ? THEME_COLORS.accent
                      : "#f2f2f2")
                    : "#fff",
                  color: answered
                    ? (opt === q.answer
                      ? "#fff"
                      : THEME_COLORS.primary)
                    : THEME_COLORS.primary,
                  fontWeight: 600,
                  fontSize: "1.02rem",
                  borderRadius: "8px",
                  border: `1.5px solid ${THEME_COLORS.primary}`,
                  padding: "0.87em .5em",
                  cursor: answered ? "not-allowed" : "pointer",
                  transition: "background 0.17s"
                }}
                onClick={() => {
                  if (!answered) handleSubmit(opt);
                }}
                disabled={answered}
                aria-label={`Choose answer ${idx + 1}: ${opt}`}
                data-testid={`opt-${idx}`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Show feedback */}
        {answered && (
          <div
            style={{
              marginTop: "1.18rem",
              fontWeight: 700,
              fontSize: "1.13rem",
              color: correct
                ? THEME_COLORS.accent
                : "#d32f2f",
              letterSpacing: ".04em"
            }}
          >
            {correct === null
              ? (timer === 0 ? "Time's up!" : "")
              : correct
              ? "Correct!"
              : (
                <>
                  Incorrect.
                  <span style={{ display: "block", color: THEME_COLORS.primary, marginTop: 5, fontWeight: 500, fontSize: ".97rem" }}>
                    Answer: <b>{q.answer}</b>
                  </span>
                </>
              )
            }
          </div>
        )}

        {/* Next button */}
        {answered && (gameMode !== "timed" || timer === 0) && (
          <button
            style={{
              marginTop: "1.75em",
              background: THEME_COLORS.primary,
              color: "#fff",
              padding: ".68em 2em",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "1.02rem",
              cursor: "pointer"
            }}
            onClick={() => {
              handleNext();
              setShowHint(false);
              setUserInput("");
              setCorrect(null);
              setAnswered(false);
            }}
          >
            {current === DEMO_QUESTIONS.length - 1 && gameMode !== "timed" ? "Finish" : "Next"}
          </button>
        )}

        {/* Hint popup */}
        {showHint && (
          <div
            style={{
              marginTop: ".9em",
              background: THEME_COLORS.primary,
              color: "#fff",
              padding: "0.55em 1.4em",
              borderRadius: "10px",
              fontWeight: 500,
              fontSize: ".98em",
              boxShadow: "0 2px 10px rgba(0,0,0,0.14)",
              display: "inline-block"
            }}
            data-testid="hint-box"
          >
            {q.hint}
            {q.musicDirector && (
              <span style={{ display: "block", color: THEME_COLORS.secondary, fontSize: ".94em" }}>
                Music: {q.musicDirector}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Responsive floating hint button
  // PUBLIC_INTERFACE
  function renderHintButton() {
    if (!DEMO_QUESTIONS[current]) return null;
    return (
      <button
        style={floatingHintStyle}
        aria-label="Show hint"
        title="Show Hint"
        onClick={() => setShowHint((v) => !v)}
        tabIndex={0}
      >
        ?
      </button>
    );
  }

  // Mode Switcher
  // PUBLIC_INTERFACE
  function renderModeSwitcher() {
    return (
      <div style={modeSwitcherStyle}>
        {MODES.map((m) => (
          <button
            key={m.key}
            style={{
              background: gameMode === m.key ? THEME_COLORS.primary : "#fff",
              color: gameMode === m.key ? "#fff" : THEME_COLORS.primary,
              border: `2px solid ${THEME_COLORS.primary}`,
              borderRadius: "24px",
              padding: "0.64em 1.34em",
              fontSize: "0.96em",
              fontWeight: 600,
              marginRight: 4,
              cursor: "pointer",
              opacity: showInstructions ? 0.8 : 1,
              transition: "all 0.18s"
            }}
            onClick={() => handleModeSelect(m.key)}
            aria-current={gameMode === m.key}
          >
            {m.label}
          </button>
        ))}
        <button
          onClick={handleShowInstructions}
          style={{
            background: "#fff",
            color: THEME_COLORS.accent,
            border: `2px solid ${THEME_COLORS.accent}`,
            borderRadius: "18px",
            padding: "0.55em 1em",
            fontSize: ".95em",
            marginLeft: 5,
            fontWeight: 700,
            cursor: "pointer"
          }}
          aria-label="Show instructions"
        >?</button>
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function renderScoreBar() {
    return (
      <div style={scorebarStyle}>
        <span>
          Score:&nbsp;
          <span style={{
            color: THEME_COLORS.accent,
            fontWeight: 800,
            fontSize: "1.18em"
          }}>{score}</span>
        </span>
        {gameMode === "timed" && (
          <span style={{
            color: timer < 10 ? "#d32f2f" : THEME_COLORS.primary,
            fontWeight: 800,
            letterSpacing: "0.04em"
          }}>
            ⏱&nbsp;{timer}s
          </span>
        )}
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function renderInstructions() {
    return (
      <div style={{
        ...cardStyle,
        maxWidth: 520,
        background: "#fff",
        alignItems: "flex-start",
        color: THEME_COLORS.primary,
        boxShadow: "0 2px 18px #0000"
      }}>
        <h2 style={{ fontWeight: 800, color: THEME_COLORS.primary, fontSize: "2rem", marginBottom: ".55em" }}>
          🎶 LyriTamil - How to Play
        </h2>
        <ol style={{ fontSize: "1.1rem", margin: "0.7em 0 1.5em 1em", padding: 0, color: THEME_COLORS.primary, lineHeight: 1.57 }}>
          <li>
            <b>Choose a Mode:</b>
            <ul style={{ margin: "0.3em 0 0.4em 1em", fontSize: ".96em" }}>
              <li><b>Guess The Song:</b> Type your answer for each lyric.</li>
              <li><b>Multiple Choice:</b> Pick from four options.</li>
              <li><b>60s Challenge:</b> Answer as many as you can in 60 seconds!</li>
            </ul>
          </li>
          <li>
            <b>Read the translated lyric</b> shown in English.
          </li>
          <li>
            <b>Guess the Tamil movie or song</b> by typing or selecting the answer.
          </li>
          <li>
            <b>Use the ? Hint</b> for actor or music director clue.
          </li>
          <li>
            <b>Track your score</b> at the top, and try to top your best!
          </li>
        </ol>
        <div style={{
          width: "100%",
          display: "flex",
          gap: "10px",
          justifyContent: "center"
        }}>
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => handleModeSelect(m.key)}
              style={{
                background: THEME_COLORS.primary,
                color: "#fff",
                borderRadius: "10px",
                border: "none",
                fontWeight: 700,
                fontSize: "1.01em",
                padding: ".7em 1.7em",
                marginBottom: ".2em",
                cursor: "pointer"
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      {/* Game header top bar */}
      <header style={{
        width: "100%",
        background: THEME_COLORS.primary,
        color: "#fff",
        padding: "1.2rem 0",
        fontWeight: 800,
        fontSize: "2rem",
        letterSpacing: ".01em",
        textAlign: "center",
        position: "sticky",
        top: 0,
        zIndex: 6,
        boxShadow: "0 0.5px 8px #0002"
      }}>
        LyriTamil
      </header>

      {renderModeSwitcher()}

      {renderScoreBar()}

      <main style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
        {showInstructions ? renderInstructions() : renderGameCard()}
      </main>

      {!showInstructions && renderHintButton()}

      {/* Modern minimalistic footer */}
      <footer style={{
        width: "100%",
        textAlign: "center",
        fontSize: ".98rem",
        fontWeight: 500,
        margin: "2.5rem 0 1rem 0",
        color: "#4d1257a0"
      }}>
        Made with <span style={{ color: THEME_COLORS.accent }}>❤</span> for Tamil music fans.
      </footer>
    </div>
  );
}

export default LyricGameApp;
