# Getting Your Pipeline Actually Running on GitHub — Step by Step

This turns your MaxtonRCM framework from "I understand the theory" into "I have a real, green pipeline I can show in an interview."

---

## What I already did for you

- Moved the dummy app into a `docs/` folder (GitHub Pages serves from here)
- Renamed it to `index.html` (required — Pages looks for this filename)
- Removed every `file://` reference from `playwright.config.ts` and all 8 spec files
- Rewrote `.github/workflows/playwright.yml` into 3 chained jobs:
  1. **deploy-app** — publishes `docs/index.html` to a live GitHub Pages URL
  2. **smoke-tests** — runs only after the app is live, tests against that real URL
  3. **regression-tests** — runs only after smoke passes

You don't need to touch any of this code. You just need to get it onto GitHub and flip one setting.

---

## Step 1 — Create the GitHub repository

1. Go to github.com and log in (create a free account if you don't have one)
2. Click the **+** icon top-right → **New repository**
3. Name it exactly: `maxton-rcm-automation`
4. Keep it **Public** (GitHub Pages free tier requires public repos)
5. Do **not** check "Add a README" — leave it empty
6. Click **Create repository**

---

## Step 2 — Push your code

GitHub will show you a page with commands. On your own machine, open a terminal in the unzipped `maxton-rcm-automation` folder and run:

```bash
git init
git add .
git commit -m "Initial commit: MaxtonRCM Playwright framework"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/maxton-rcm-automation.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

> If `git` isn't installed, download it from git-scm.com first.

---

## Step 3 — Replace YOUR-USERNAME in 9 files

Before pushing (or after — you can push again), find-and-replace `YOUR-USERNAME` with your real GitHub username in:

- `playwright.config.ts`
- All 8 files inside `tests/e2e/`

The easiest way: open the project in VS Code, press `Ctrl+Shift+H` (Find & Replace in all files), search `YOUR-USERNAME`, replace with your actual username, replace all.

Then commit and push again:
```bash
git add .
git commit -m "Set actual GitHub username in BASE_URL"
git push
```

---

## Step 4 — Turn on GitHub Pages

1. On your repo page, click **Settings** (top tab)
2. In the left sidebar, click **Pages**
3. Under "Build and deployment" → **Source**, select **GitHub Actions** (not "Deploy from a branch")
4. That's it — no save button needed, it applies immediately

---

## Step 5 — Watch it run

1. Click the **Actions** tab on your repo
2. You should see a workflow run already in progress (triggered by your push) — click it
3. You'll see exactly the 3-job structure from the diagram I showed you:
   - `deploy-app` (green check when done — your app is now live at `https://YOUR-USERNAME.github.io/maxton-rcm-automation/`)
   - `smoke-tests` (waits for deploy-app, then runs)
   - `regression-tests` (waits for smoke-tests, then runs)
4. Click into any job to see live logs, exactly like a real pipeline

---

## What "success" looks like

All 3 jobs show green checkmarks. Click `regression-tests` → it should show ~60 passed tests. Click on the `regression-report` artifact at the bottom of that job's page to download the actual Playwright HTML report with screenshots.

## What to do if something's red

This is the actually valuable part — debugging is the real skill.

| Symptom | Likely cause | Fix |
|---|---|---|
| `deploy-app` fails | Pages not set to "GitHub Actions" source | Redo Step 4 |
| `smoke-tests` fails immediately | `YOUR-USERNAME` not replaced | Redo Step 3, check for typos |
| Tests time out / can't find elements | Page took longer to load than expected | This is a real flaky-test scenario — try re-running the job once |
| `npm ci` fails | package-lock.json missing or corrupted | Run `npm install` locally once, commit the generated `package-lock.json`, push again |

---

## Why this matters for your interview

Once this is green, you can literally say: *"Here's my GitHub repo, here's the Actions tab, here's a pipeline I built that deploys the app, gates regression behind smoke tests, and uploads test reports as artifacts."* That's a completely different sentence than reciting what a pipeline does in theory.
