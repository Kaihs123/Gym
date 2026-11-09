# AETHER Gym

A gym tracker people install on their phone like an app. Everyone signs up with their own email and password, and their workouts and progress photos are saved to their account, private to them.

## 1. Make the database (Supabase, about 5 minutes)

1. Go to supabase.com and create a **new project** (call it `aether-gym`). Keep it separate from TheFairway so gym sign-ups don't appear on your golf leaderboard.
2. Open **SQL Editor → New query**, paste everything in `setup.sql`, then press **Run**. You should see "Success".
3. Open **Authentication → Sign In / Providers → Email**:
   - Leave **Email** turned on.
   - Turn **Confirm email** off if you want people straight in (on means they must click a link in an email first; both work).
4. Open **Authentication → URL Configuration** and set **Site URL** to your app's address from step 2 below (for example `https://kaihs123.github.io/aether-gym/`). Add the same address under **Redirect URLs**. This makes password-reset emails open the app.
5. Open **Project Settings → API** (or the **Connect** button) and copy the **Project URL** and the **publishable / anon key**.
6. Paste them into `config.js`.

## 2. Put it online (GitHub Pages)

1. On GitHub, create a new **public** repository called `aether-gym`.
2. **Add file → Upload files**, and drag in everything from this folder, including the `icons` folder. Commit.
3. **Settings → Pages**: Source "Deploy from a branch", branch `main`, folder `/ (root)`. Save.
4. After a minute the app is live at `https://kaihs123.github.io/aether-gym/`.

## 3. Install it on a phone

- **iPhone:** open the link in Safari → Share → **Add to Home Screen** → Add.
- **Android:** open the link in Chrome → it offers **Install app**, or ⋮ menu → **Install app / Add to Home screen**.

It opens full screen with its own icon, like any other app.

## Updating later

Upload the changed files to the repo, and in `sw.js` change `aether-gym-v1` to `aether-gym-v2` (v3, and so on) so phones pick up the new version.

## Files

| File | What it does |
|---|---|
| `index.html` | The page |
| `config.js` | Your Supabase address and key |
| `supa.js` | Sign-in screen, account menu, saving to Supabase |
| `app-gym.js`, `app-gym.css` | The gym tracker |
| `hub.js`, `hub.css`, `theme.js` | Layout, themes, icons, dark mode |
| `app.css` | Sign-in screen and switches |
| `manifest.webmanifest`, `icons/` | App name and home-screen icons |
| `sw.js` | Makes it open instantly and work offline |
| `setup.sql` | Database tables and privacy rules (run once) |
