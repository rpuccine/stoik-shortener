# URL Shortener — Frontend (Node 22.18, React, Vite, TS, Material UI)

Minimal, clean and well-documented React UI for the URL shortener API.

## Quickstart

```bash
# Prerequisites: Node >= 22.18
npm install
npm start            # launches Vite dev server on http://localhost:5173
```

By default the app calls the API at `http://localhost:3000`.  
You can override it via an env var in a `.env` file:

```
VITE_API_BASE=http://localhost:3000
```

## Project structure

```
src/
  App.tsx            # top-level composition + UX feedback
  main.tsx           # React root + MUI theme provider
  theme.ts           # small MUI theme customization
  types.ts           # DTOs for the API
  lib/api.ts         # tiny fetch client
  components/
    UrlForm.tsx      # validated form (Zod) to shorten URLs
    ResultCard.tsx   # short link + stats display
```

## Design choices (brief)

- **Material UI**: consistent design system, responsive by default, accessible components.
- **Zod**: strict input validation on the client (mirrors server-side validation).
- **Minimal state**: `App` owns only what's needed (result, stats, snackbar).
- **Composition over complexity**: components are small and well-named.
- **Docs & comments**: each file explains its purpose; functions/components have clear props.

## Developer notes

- Keep UI logic deterministic; perform side-effects (API calls, clipboard) in handlers.
- Input validation stays **close to inputs** (in `UrlForm`) for better UX.
- Error messages are concise and safe — server details shouldn't leak to users.
- If you add features (e.g., custom slugs), extend `types.ts`, then the form, then `api.ts`.

Enjoy! ✨
