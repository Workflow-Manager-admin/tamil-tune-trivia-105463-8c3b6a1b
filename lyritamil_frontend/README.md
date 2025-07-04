# Tamil Movie Connections Game

A modern, minimal React web game where you guess the Tamil movie based on unique combinations of actors who co-starred together! Powered by the [TMDb API](https://www.themoviedb.org/).

---

## 🎮 How to Play

- You'll see **2 or 3 actor names** from a randomly chosen Tamil movie.
- Your task is to **guess which movie features these actors together** from a list of choices.
- Score a point for each correct guess. Play 10 rounds per session!

---

## 🚀 Getting Started

From the `lyritamil_frontend` directory:

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) to play in your browser.

---

## 🛠️ TMDb API Setup (Required!)

1. **Get a TMDb API Token:**
   - Register/sign in at [TMDb](https://www.themoviedb.org/) and [request a v4 Read Access Token](https://www.themoviedb.org/settings/api).
   - The token is a long string starting with `eyJ...`.

2. **Set Your API Token:**
   - Create a `.env` file in the project root (same folder as `package.json`).
   - Add this line (replace with your token):

     ```
     REACT_APP_TMDB_TOKEN=your_api_token_here
     ```

   - Restart `npm start` after any `.env` change.

_Note: The app won't work without a valid TMDb API key!_

---

## ✨ Features

- **Minimal & Responsive:** Clean, mobile-first layout, fast loading.
- **Modern UI:** Custom styling, soft palette, big/loud score/feedback.
- **API-driven:** Loads latest/popular Tamil movies and their casts live from TMDb.
- **Error Handling:** Clear messages for API setup/connection issues.
- **No Lyrics:** This version has no lyric/game code — fully movies/actor-based.

---

## 📝 Customize & Extend

- Core logic lives in `src/App.js`.
- All TMDb API usage documented in code comments.
- Brand/design can be tweaked in `src/App.css`.

For more details, see [TMDb API Docs](https://developer.themoviedb.org/docs).

---

## 🧑‍💻 Credits
Created for Kollywood fans. Uses [The Movie Database (TMDb)](https://www.themoviedb.org/) APIs but is not endorsed/certified by TMDb.
