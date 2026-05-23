# Contendly Hackathon Platform

Standalone Next.js 14 mission-console UI for Project Defend, styled to match the Contendly landing-page aesthetic.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- `next/font/google` (Space Mono + DM Sans)

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open:

```text
http://localhost:3000
```

## Access Flow

- App entry is `/access`.
- Learner login uses `POST /learners/login` and expects `{ accessCode: string }`.
- Default API base URL is `http://localhost:4000`.
- You can override the API base URL with:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

- On successful login, the returned `accessToken` is stored in `sessionStorage` and used as the client-side route guard.
- Session is cleared via `// EXIT MISSION`.

## Notes

- All mission, class, and progress data is hardcoded in [`lib/mockData.ts`](./lib/mockData.ts).
- Activity/flag data remains mock-only (no submission backend).
