# Deploying to GitHub Pages

The repository is already initialised in this folder with one commit ready to push. Pick whichever route suits you.

---

## Route A — Git on the command line (recommended)

**1. Create the repo on GitHub**

Go to **https://github.com/new**

- **Repository name:** `invitation`
- **Public** (Pages needs public, unless you have a paid plan)
- **Do not** tick "Add a README", "Add .gitignore" or "Choose a license" — the folder already has files, and an initial commit on GitHub's side would collide with ours

Click **Create repository**.

**2. Push**

Open PowerShell or Git Bash **in this folder** (`C:\Users\udhay\Downloads\invitation`) — in File Explorer you can type `powershell` into the address bar to land there.

```powershell
git remote add origin https://github.com/YOUR-USERNAME/invitation.git
git push -u origin main
```

Replace `YOUR-USERNAME`. If it asks you to sign in, a browser window opens — approve it. If it asks for a password in the terminal instead, that won't work: GitHub needs a Personal Access Token. Easiest fix is to install [GitHub CLI](https://cli.github.com/), run `gh auth login` once, then push again.

Don't have git yet? https://git-scm.com/download/win — accept all defaults.

**3. Turn on Pages**

In the repo: **Settings** → **Pages** (left sidebar)

- **Source:** `Deploy from a branch`
- **Branch:** `main`, folder `/ (root)`
- **Save**

Wait 1–2 minutes. The Pages settings page then shows your live URL:

```
https://YOUR-USERNAME.github.io/invitation/
```

---

## Route B — No terminal, browser only

1. **https://github.com/new** → name it `invitation`, **Public**, create it (nothing ticked).
2. On the empty repo page click **uploading an existing file**.
3. Open `C:\Users\udhay\Downloads\invitation` in File Explorer, select **everything** — `index.html`, `assets`, `tools`, `docs`, `README.md`, `DEPLOY.md`, `.gitignore`, `.nojekyll` — and drag it onto the GitHub page.
   - Windows hides `.nojekyll` by default. In File Explorer: **View → Show → Hidden items**. This file matters — without it Pages may ignore the `assets` folder.
   - Drag the **contents** of the folder, not the folder itself, or everything ends up one level too deep.
4. **Commit changes.**
5. Then follow **step 3** above to turn on Pages.

---

## Checking it worked

Open your Pages URL and confirm:

| Check | What you should see |
|---|---|
| `…/invitation/` | Tamil invitation, kolam loader clears in ~1.5s |
| `…/invitation/?lang=en` | Same page in English |
| `…/invitation/?id=A1001` | "Welcome, Dr. Ramesh Kumar" (English — his stored preference) |
| `…/invitation/?id=A1002` | "இல்லம் வருக, R. சுரேஷ் குடும்பத்தார்" |
| `…/invitation/?id=NOPE` | Falls back to the generic greeting, no error |
| Language button (top right) | Switches, and the URL updates so it's shareable |
| Countdown | Ticking down to 13 Sep 2026, 06:00 IST |
| Schedule | Two cards — reception Sat 12th, muhurtham Sun 13th |
| `…/invitation/?n=Ramesh%20Mama&c=Relative` | "Welcome, Ramesh Mama" — works with no setup |
| `…/invitation/tools/create.html` | The link creator your family will use |
| `…/invitation/tools/links.html` | Curated links + QR codes for everyone in `guests.json` |

Then open it on a real phone over mobile data — that's the environment most of your guests will be in.

**If you see a blank page or the loader spins:** open the browser console (F12) and look for a red 404. Nine times out of ten it's a filename-case mismatch — GitHub Pages is case-sensitive where Windows isn't.

---

## Making changes after launch

```powershell
git add -A
git commit -m "what changed"
git push
```

Pages redeploys within a minute. Hard-refresh (`Ctrl+Shift+R`) to skip the cache.

Before pushing content edits, it's worth running the test suite:

```powershell
npm install jsdom
node tools/test.mjs
```

---

## Sharing the work with your family

Once Pages is live, send your relatives this one link:

```
https://YOUR-USERNAME.github.io/invitation/tools/create.html
```

They can each make personal invitation links for their own side of the guest list — on their phone, in Tamil or English, no accounts, no app, nothing to install. Type a name, tap **WhatsApp**, done. Nothing they do can break the site, because the page only builds links; it never writes anything.

Worth telling them: **the guest's name appears in the link they generate.** That's how it works without a database. Same information as the printed card, so it's fine — just not the place for anything private.

## Two notes before you send links to guests

**Guest IDs are not private.** `assets/data/guests.json` is a public file on a public site — anyone can open it and read the whole list. That's fine for names and categories. Don't add phone numbers, addresses or anything you wouldn't put on the printed card.

**Consider a shorter link.** `https://username.github.io/invitation/?id=A1001` is a mouthful in a WhatsApp message. If you own a domain, **Settings → Pages → Custom domain** works and needs no code changes. Otherwise the WhatsApp buttons in `tools/links.html` wrap the link in a friendly message, which reads better than pasting the bare URL.
