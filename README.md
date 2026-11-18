<div align="center">

# READORIA

**Read. Listen. Download.**

A black-and-white glass web-novel reader with text-to-speech, PDF downloads, comments and view counts.

### [🌐 Live site: Readoria — read, listen, download](https://novel-web-frontend.vercel.app/)

</div>

---

## Features

| | |
|---|---|
| 📖 **Read** | Browse, search, filter by genre, sort by latest / views / chapters / title. Clean reader with font size, serif/sans, keyboard arrows and "Continue reading". |
| 🔊 **Listen** | Built-in text-to-speech (Web Speech API): voice picker, speed control, paragraph highlighting, double-click a paragraph to start there, auto-play next chapter. |
| ⬇️ **Download** | PDF or TXT for a single chapter, a range (`1-50`), hand-picked chapters, or the whole novel (max 300 chapters per file). |
| 💬 **Comments** | Comment on a novel or on a specific chapter. Login required to post; owners and admins can delete. |
| 👁 **Views** | Novel and chapter view counters, de-duplicated per IP (30 min). |
| 🎨 **Theme** | Black glass by default, white glass via the ☀ / ☾ toggle. |

## Tech stack

- **Frontend** – React 19, TypeScript, Vite, Tailwind CSS 4, React Router, Axios
- **Backend** – Node.js, Express 5, TypeScript, Mongoose, JWT, PDFKit
- **Database** – MongoDB Atlas (database `Readoria`)
- **Hosting** – Frontend on Vercel

## Project structure

```
readoria/
├── readoria-api/            # REST API
│   └── src/
│       ├── config/          # env loading
│       ├── controllers/     # auth, novel, download, comment
│       ├── db/              # index creation
│       ├── middleware/      # JWT auth
│       ├── models/          # Novel, Chapter, Comment, User
│       ├── routes/
│       └── util/            # jwt, rate limiter, helpers
└── readoria-web/            # React app
    └── src/
        ├── components/      # layout, common, novel, comment, reader
        ├── context/         # AuthContext
        ├── hooks/           # useAuth, useTheme, useSpeech
        ├── pages/           # Home, Browse, NovelDetail, Reader, Login, Register
        ├── router/
        ├── service/         # axios API clients
        └── util/
```

## Data model

`novels` and `chapters` are filled by the scraper; `users` and `comments` are created by the API.

```jsonc
// novels
{ "slug": "overgeared", "title": "Overgeared", "author": "Park Saenal", "cover": "https://…",
  "description": "", "genres": ["Action", "Fantasy"], "tags": [], "chapter_count": 2059,
  "source_url": "https://novelfull.net/overgeared.html", "views": 0 }

// chapters
{ "novel_slug": "overgeared", "index": 1, "title": "…", "volume": null,
  "paragraphs": ["…", "…"], "url": "https://…", "views": 0 }
```

## Getting started

### 1. API

```bash
cd readoria-api
cp .env.example .env      # then fill in the values
npm install
npm run dev               # http://localhost:5000
```

`.env`

```dotenv
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net
MONGODB_DB=Readoria
JWT_SECRET=<long random string>
JWT_REFRESH_SECRET=<another long random string>
CORS_ORIGIN=http://localhost:3000,https://novel-web-frontend.vercel.app
PDF_FONT_PATH=            # optional: Unicode .ttf for non-Latin PDFs
MAX_DOWNLOAD_CHAPTERS=300
```

In Atlas, add your IP (or your host's IP) under **Network Access**.

### 2. Web

```bash
cd readoria-web
cp .env.example .env
npm install
npm run dev               # http://localhost:3000
```

`.env`

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### Production build

```bash
cd readoria-api && npm run build && npm start
cd readoria-web && npm run build      # outputs dist/
```

## Deployment

- **Frontend (Vercel)** – live at **https://novel-web-frontend.vercel.app/**. Set `VITE_API_BASE_URL` in the Vercel project settings to your deployed API URL (ending in `/api/v1`). `vercel.json` already rewrites all routes to `index.html` so deep links like `/novel/overgeared` work.
- **API** – deploy `readoria-api` to any Node host (Render, Railway, Fly.io…). Build command `npm run build`, start command `npm start`, and add the `.env` values above. Add the Vercel URL to `CORS_ORIGIN`.

## API reference (`/api/v1`)

| Method | Path | Description |
|---|---|---|
| GET | `/novels?q&genre&sort&page&limit` | List / search (`sort`: `latest`, `views`, `chapters`, `title`) |
| GET | `/novels/genres` | Genres with counts |
| GET | `/novels/:slug` | Novel details |
| POST | `/novels/:slug/view` | Register a view |
| GET | `/novels/:slug/chapters` | Chapter list (no text) |
| GET | `/novels/:slug/chapters/:index` | Chapter text + previous/next |
| GET | `/novels/:slug/download?format=pdf\|txt&chapters=1-10,15` | Download; omit `chapters` for the whole novel |
| GET | `/comments?novel=<slug>&chapter=<n>` | List comments (omit `chapter` for novel-level) |
| POST | `/comments` | Add comment 🔒 `{ novel, chapter, body }` |
| DELETE | `/comments/:id` | Delete comment 🔒 owner or admin |
| POST | `/auth/register` · `/auth/login` · `/auth/refresh` | Auth |
| GET | `/auth/me` | Current user 🔒 |
| GET | `/health` | Health check |

🔒 = requires `Authorization: Bearer <access token>`

## Notes

- **Admin user:** set `roles: ["ADMIN"]` on a user document in Atlas.
- **PDF fonts:** default PDFs cover Latin text only. For Korean/Chinese/etc. set `PDF_FONT_PATH` to a Unicode font, or download as TXT.
- **Text-to-speech** relies on the voices installed in the visitor's browser/OS, so available voices vary.
- **Security:** never commit `.env`. If a database password was ever shared publicly, rotate it in Atlas.

## License

For personal / educational use. Novel content belongs to its respective authors and translators.
