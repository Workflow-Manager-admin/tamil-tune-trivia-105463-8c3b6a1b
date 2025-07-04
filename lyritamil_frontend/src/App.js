import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Tamil Movie Connections Game
 * 
 * This app fetches random Tamil movies and their casts from the TMDb API.
 * For each round:
 *   - Pick two or three actors from a random movie as a "combination"
 *   - Present these actor names as a clue
 *   - User guesses the movie from several choices (multiple choice), or can type in the answer
 * 
 * === TMDb API Setup (Required) ===
 * 1. Register for a free TMDb (https://www.themoviedb.org/) account and visit https://www.themoviedb.org/settings/api to request an API key.
 * 2. Store the TMDb API Read Access Token (v4 auth, starts with 'eyJ...') in a `.env` file at the project root:
 *    REACT_APP_TMDB_TOKEN=your_tmdb_bearer_token
 * 3. The React app will read process.env.REACT_APP_TMDB_TOKEN at runtime.
 *    You may also define it in the environment before `npm start`.
 *
 * For testing, you may hardcode the token below (remove before pushing anywhere public).
 * 
 * All TMDb usage and endpoints referenced in comments below.
 * API Docs: https://developer.themoviedb.org/docs
 */

// -- TMDb API Helper Functions & Constants --

const TMDB_TOKEN =
  process.env.REACT_APP_TMDB_TOKEN ||
  ""; // Reads from real .env, never hardcoded

const TMDB_API = "https://api.themoviedb.org/3";

/**
 * Fetch a single page of Tamil movies. Throws on error.
 * @param {number} page
 * @returns {Promise<Array>}
 */
async function fetchTamilMovies(page = 1) {
  const url = `${TMDB_API}/discover/movie?with_original_language=ta&sort_by=popularity.desc&vote_count.gte=10&page=${page}`;
  const headers = {
    Authorization: "Bearer " + TMDB_TOKEN,
    "Content-Type": "application/json;charset=utf-8",
  };
  try {
    const res = await fetch(url, { headers });
    if (!res.ok)
      throw new Error(
        `TMDb: failed to fetch Tamil movies (status ${res.status} ${res.statusText})`
      );
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    throw new Error(
      "TMDb: Could not load Tamil movies. " + (err?.message || "")
    );
  }
}

/**
 * Fetch *all* pages of Tamil movies up to maxPages (deepens coverage).
 * Attempts to fetch as large a pool as allowed by TMDb (for quiz reliability).
 * Improved error details for diagnosing catalog/coverage or API key issues.
 * @param {number} maxPages
 * @returns {Promise<Array>}
 */
async function fetchAllTamilMovies(maxPages = 12) {
  let all = [];
  let lastErr = null;
  for (let p = 1; p <= maxPages; ++p) {
    let pageResults = [];
    try {
      pageResults = await fetchTamilMovies(p);
    } catch (e) {
      lastErr = e;
      // Continue if a single page fails; break if it's due to authorization
      if (e && (e.message?.includes("401") || e.message?.includes("Invalid"))) {
        throw new Error("TMDb API authorization failed. Please check your API key/token in the .env file.");
      }
      break;
    }
    if (!pageResults.length) break;
    all = all.concat(pageResults);
    // TMDb API: If there's a fixed total_pages, avoid unnecessary requests by stopping early
    if (p === 1 && pageResults.total_pages) {
      maxPages = Math.min(maxPages, pageResults.total_pages);
    }
  }
  // Deduplicate by id/title and remove adults/missing
  const seen = new Set();
  all = all.filter((m) => {
    if (!m.id || !m.title) return false;
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return !m.adult;
  });
  if (!all.length && lastErr) {
    throw lastErr;
  }
  return all;
}

/**
 * Fetch full movie credits to get the cast list for a movie.
 * @param {number|string} movieId
 * @returns {Promise<Array>}
 */
async function fetchMovieCast(movieId) {
  const url = `${TMDB_API}/movie/${movieId}/credits`;
  const headers = {
    Authorization: "Bearer " + TMDB_TOKEN,
    "Content-Type": "application/json;charset=utf-8",
  };
  try {
    const res = await fetch(url, { headers });
    if (!res.ok)
      throw new Error(
        `TMDb: failed to fetch cast for movie ${movieId} (status ${res.status})`
      );
    const data = await res.json();
    return data.cast || [];
  } catch (err) {
    throw new Error(
      `TMDb: Could not load cast for movie ${movieId}. ${
        err?.message || ""
      }`
    );
  }
}

/**
 * PUBLIC_INTERFACE
 * Loads a pool of random Tamil movies and their cast combinations,
 * Prepares an array of questions:
 *    { actors: [name1, name2, ...], answer: movieTitle, choices: [movieTitle, ...] }
 * If error, throws with message.
 */
async function fetchConnectionQuestions(rounds = 10) {
  // Fetch extra pages for better randomization & quiz validity (larger pool)
  let allMovies = [];
  let fetchErr = null;
  try {
    allMovies = await fetchAllTamilMovies(12); // fetch up to 12 pages (~200+ movies)
  } catch (e) {
    fetchErr = e;
  }
  allMovies = Array.isArray(allMovies) ? allMovies.filter((m) => m.id && m.title && !m.adult) : [];

  if (allMovies.length < rounds + 5) {
    let msg = "Not enough Tamil movies found from TMDb to create a playable game. ";
    if (fetchErr) {
      msg += "TMDb API error: " + fetchErr.message;
    } else {
      msg += "Possible reasons:\n";
      msg += "- The TMDb API key/token is incorrect or missing in your .env file.\n";
      msg += "- Network issues prevented contacting TMDb.\n";
      msg += "- TMDb catalog coverage for Tamil cinema is incomplete.\n";
      msg += "Tried to fetch at least " + (rounds+5) + " movies, but only found " + allMovies.length + ".\n";
      msg += "If your API key is correct, you may need to wait and try again later, or help improve TMDb catalog data!\n";
      msg += "Check the API documentation and .env setup as described in the README.";
    }
    throw new Error(msg);
  }

  // Shuffle for randomness
  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

  const questions = [];
  const usedMovieIds = new Set();

  let tries = 0;
  while (questions.length < rounds && tries < rounds * 8) {
    tries++;
    const movie =
      allMovies[Math.floor(Math.random() * allMovies.length)];
    if (!movie || usedMovieIds.has(movie.id)) continue;

    usedMovieIds.add(movie.id);

    // For current movie, get cast
    let cast;
    try {
      cast = await fetchMovieCast(movie.id);
    } catch (e) {
      continue;
    }
    cast = Array.isArray(cast) ? cast.filter((p) => !!p.name) : [];

    // Pick 2–3 random actors (focused on 'Acting')
    let mainActors = cast.filter(
      (c) => c.known_for_department === "Acting"
    );
    if (mainActors.length < 2) continue;
    mainActors = shuffle([...mainActors]);
    const nActors = Math.random() < 0.40 ? 3 : 2;
    const actors = mainActors.slice(0, nActors).map((c) => c.name);

    // Choices: answer + 3 incorrect movie titles
    const incorrect = [];
    while (incorrect.length < 3) {
      const idx = Math.floor(Math.random() * allMovies.length);
      const other = allMovies[idx];
      if (other.id !== movie.id && !incorrect.some((c) => c.id === other.id))
        incorrect.push(other);
    }
    const choices = shuffle([movie.title, ...incorrect.map((m) => m.title)]);

    questions.push({
      actors,
      answer: movie.title,
      choices,
      movie, // Expose for details
    });
  }

  if (!questions.length) {
    let msg = "Could not generate quiz – not enough movie/cast data from TMDb to create game rounds. ";
    msg += "This may be due to TMDb API limits, insufficient Tamil movies in their database, or temporary server issues. ";
    msg += "If you encounter this repeatedly, check your .env for TMDb API key correctness, your internet connection, or wait and try later.";
    throw new Error(msg);
  }

  return questions;
}

/**
 * PUBLIC_INTERFACE
 * TamilMovieConnectionsApp: Main Game Component. 
 * Handles loading questions, game round state, answer logic, and UI.
 */
function TamilMovieConnectionsApp() {
  // Game state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState(null); // null/true/false per round
  const [score, setScore] = useState(0);

  // Fetch data on load
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    fetchConnectionQuestions(10)
      .then(qs => {
        if (!mounted) return;
        setQuestions(qs);
        setIndex(0);
        setScore(0);
        setAnswered(false);
        setResult(null);
        setLoading(false);
      })
      .catch(e => {
        setError("Could not load movie data. " + (e?.message || ""));
        setQuestions([]);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  // Submission logic
  function handleChoice(choice) {
    if (answered) return;
    const correct = questions[index].answer === choice;
    setResult(correct);
    setAnswered(true);
    if (correct) setScore(s => s + 1);
  }
  function handleNext() {
    setIndex(idx => idx + 1);
    setAnswered(false);
    setResult(null);
  }
  function restartGame() {
    window.location.reload();
  }

  // UI: Card Component
  function renderCard() {
    if (loading) {
      return <div className="tmc-card"><h3>Loading game…</h3></div>;
    }
    if (error) {
      return (
        <div className="tmc-card tmc-error">
          <h3>Error</h3>
          <div>{error}</div>
          <button className="tmc-btn" onClick={restartGame}>Retry</button>
        </div>
      );
    }
    if (!questions.length) {
      return (
        <div className="tmc-card">
          <h3>No questions available</h3>
          <p>Sorry, could not load enough Tamil movie/cast data from TMDb.</p>
          <button className="tmc-btn" onClick={restartGame}>Retry</button>
        </div>
      );
    }
    // Instructions view
    if (index === 0 && !answered) {
      return (
        <div className="tmc-card" style={{ alignItems: "flex-start" }}>
          <h2 style={{ fontWeight: 800, marginBottom: 12 }}>
            🎬 Tamil Movie Connections — Instructions
          </h2>
          <ol style={{ fontSize: "1.07rem", margin: "1em 0 1.5em 1.3em", padding: 0, lineHeight: 1.5 }}>
            <li>
              You’ll be shown <b>2 or 3 Tamil actor names</b> who starred in the same movie.
            </li>
            <li>
              Guess which <b>movie connects</b> these actors from the options below.
            </li>
            <li>
              Tap your answer. <b>Score 1 point</b> for each correct guess.
            </li>
            <li>
              Press <b>Next</b> to continue. Play all 10 rounds!
            </li>
            <li>
              <b>If you see an error</b>, ensure your TMDb API token is set (see code comments).
            </li>
          </ol>
          <button className="tmc-btn tmc-accent" onClick={() => setAnswered(true)}>
            Start Game!
          </button>
        </div>
      );
    }

    const q = questions[index];
    if (!q) return <div className="tmc-card"><h3>All done!</h3></div>;
    return (
      <div className="tmc-card">
        <div className="tmc-q-title">Which movie had these actors together?</div>
        <div className="tmc-cast-list">
          {q.actors.map(a => (
            <span className="tmc-cast-actor" key={a}>{a}</span>
          ))}
        </div>
        {q.movie.release_date && (
          <div className="tmc-q-year">Year: {new Date(q.movie.release_date).getFullYear()}</div>
        )}

        <div className="tmc-choices">
          {q.choices.map(ch => (
            <button
              key={ch}
              className={
                "tmc-choice-btn" +
                (answered
                  ? ch === q.answer
                    ? " tmc-choice-correct"
                    : ch === q.choices.find((c) => c === ch) && ch === q.choices.find((c) => c === ch) && result === false
                      && ch === q.choices.find((c) => c === ch) ? " tmc-choice-selected" : ""
                  : "")
              }
              disabled={answered}
              onClick={() => handleChoice(ch)}
              aria-label={`Choose answer: ${ch}`}
              tabIndex={0}
            >
              {ch}
            </button>
          ))}
        </div>

        {answered && (
          <div className="tmc-feedback" style={{ marginTop: 20, fontWeight: 600 }}>
            {result === true ? (
              <span style={{ color: "#27bb7f" }}>Correct! 🎉</span>
            ) : (
              <>
                <span style={{ color: "#d32f2f" }}>Incorrect!</span>
                <span style={{ display: "block", color: "#555", marginTop: 4 }}>
                  Answer: <b>{q.answer}</b>
                </span>
              </>
            )}
          </div>
        )}

        <div style={{ marginTop: answered ? 18 : 32 }}>
          {index < questions.length - 1 && answered && (
            <button className="tmc-btn" onClick={handleNext}>Next</button>
          )}
          {index === questions.length - 1 && answered && (
            <button className="tmc-btn" onClick={restartGame}>Play Again</button>
          )}
        </div>
      </div>
    );
  }

  // Game UI
  return (
    <div className="App" data-theme="light">
      {/* Header */}
      <header className="tmc-header">
        Tamil Movie Connections
      </header>
      {/* Score bar */}
      <div className="tmc-score-bar">
        <span>
          Score: <b>{score}</b>
        </span>
        <span>Round: <b>{Math.min(index + 1, questions.length)}</b> / {questions.length || 10}</span>
      </div>
      {/* Main game UI */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
        {renderCard()}
      </main>
      {/* Footer */}
      <footer className="tmc-footer">
        Made with <span style={{ color: "#c0392b" }}>❤</span> for Kollywood fans. | Data via <a href="https://www.themoviedb.org/" style={{ color: "#2186ee" }}>TMDb</a>
      </footer>
    </div>
  );
}

export default TamilMovieConnectionsApp;
