Full‑stack contacts manager (Typescript, NextJS, NodeJS, Express, MongoDB) that demonstrates:
- Create a contact (first name, last name, job, email, comment)
- List contacts with pagination and search by job keyword
- View total contacts on a dashboard (SSG + ISR)
- Edit a contact
- Get all email addresses for a specific job
- Delete a contact
- Minimal tests for the API (Jest)

## Tech stack
- Frontend: Next.js (App Router), React 19, NExtJS 16, TypeScript, SWR, MUI, react-hook-form, react-toastify
- Backend: Node.js, Express, Mongoose (MongoDB)
- Database: MongoDB
- Optional rate limiter: Upstash (Redis), disabled if no creds

## Repo structure (key files)
```
root/
├─ client/                   # Next.js app
│  ├─ src/
│  │  ├─ app/
│  │  │  ├─ page.tsx                           # redirects "/" → "/dashboard"
│  │  │  ├─ layout.tsx                         # global layout + Providers + Navbar
│  │  │  ├─ dashboard/page.tsx                 # SSG + ISR dashboard
│  │  │  └─ contacts/
│  │  │     ├─ page.tsx                        # SSR list + SWR fallback
│  │  │     ├─ new/page.tsx                    # create contact
│  │  │     └─ update/[id]/page.tsx            # edit contact
│  │  ├─ providers/Notification.provider.tsx   # toasts (context)
│  │  ├─ providers/Providers.tsx               # MUI + SWR + Notifications
│  │  ├─ lib/api.ts                            # API base helper
│  │  ├─ lib/cache.ts                          # revalidate constants
│  │  ├─ shared/components/layout/navbar.tsx   # top navigation
│  │  └─ shared/models/Contact.model.tsx       # shared types
│  ├─ next.config.ts
│  └─ tsconfig.json
│
└─ server/                  # Express API
   ├─ src/
   │  ├─ app.js                               # Express app
   │  ├─ server.js                            # bootstrap + Mongo connect
   │  ├─ routes/contact.route.js              # /contacts routes
   │  ├─ controllers/contact.controller.js    # handlers
   │  ├─ services/contact.service.js          # business logic
   │  ├─ repositories/contact.repository.js   # data access
   │  ├─ models/Contact.js                    # Mongoose model
   │  └─ middleware/rateLimiter.js            # optional Upstash limiter
   ├─ tests/contacts.test.mjs                 # API tests (mongodb-memory-server)
   └─ package.json
```

Quick links:
- Client app entry: [client/src/app/layout.tsx](client/src/app/layout.tsx), [client/src/app/page.tsx](client/src/app/page.tsx)
- Dashboard: [client/src/app/dashboard/page.tsx](client/src/app/dashboard/page.tsx)
- Contacts list: [client/src/app/contacts/page.tsx](client/src/app/contacts/page.tsx)
- Create form: [client/src/app/contacts/new/page.tsx](client/src/app/contacts/new/page.tsx)
- Edit form: [client/src/app/contacts/update/[id]/page.tsx](client/src/app/contacts/update/%5Bid%5D/page.tsx)
- Notifications: [client/src/providers/Notification.provider.tsx](client/src/providers/Notification.provider.tsx)
- API helper: [client/src/lib/api.ts](client/src/lib/api.ts)
- Server routes: [server/src/routes/contact.route.js](server/src/routes/contact.route.js)

## API
Root: /contacts
- POST /contacts — create
- GET /contacts — list (query: page, limit, search)
- GET /contacts/:id — details
- PUT /contacts/:id — update
- DELETE /contacts/:id — delete
- GET /contacts/emails?job=JobName — list emails for a job

Implementation:
- Controller: [server/src/controllers/contact.controller.js](server/src/controllers/contact.controller.js)
- Service: [server/src/services/contact.service.js](server/src/services/contact.service.js)
- Repository: [server/src/repositories/contact.repository.js](server/src/repositories/contact.repository.js)
- Model: [server/src/models/Contact.js](server/src/models/Contact.js)

## Running locally (Windows PowerShell)
1) Server (requires MongoDB and MONGO_URI)
```powershell
cd server
npm install
# create server/.env and set MONGO_URI=mongodb://localhost:27017/contactsdb (or your URI)
npm run dev
# server on http://localhost:5000
```

2) Client
```powershell
cd client
npm install
# for server-side fetches on the dashboard/edit pages:
# create client/.env.local with: API_BASE_URL=http://localhost:5000
npm run dev
# open http://localhost:3000
```

Notes:
- Client proxies browser requests via Next rewrites: /api/* → http://localhost:5000/* (see [client/next.config.ts](client/next.config.ts)).
- Server-side fetches use API_BASE_URL (see [client/src/lib/api.ts](client/src/lib/api.ts)).

## Usage (frontend)
- Dashboard: /dashboard (SSG + ISR) shows total contacts.
- List: /contacts (SSR initial + SWR refresh, pagination + search by job).
- Create: /contacts/new
- Edit: /contacts/update/:id (navigate from list “Update”)
- Delete: from list; auto-refreshes and paginates properly.
- Notifications: toasts via context (see [Notification.provider](client/src/providers/Notification.provider.tsx)).

## Testing the API
```powershell
cd server
npm test
# Tests use mongodb-memory-server; no external Mongo needed for tests.
```

## Dev notes
- Next App Router routing: file-based routes under client/src/app.
- URL is the source of truth for pagination/search; client updates the query string which triggers SSR re-render + SWR refetch.

## Architecture
```
[Next.js client (App Router, SWR)]
            |
       /api proxy
            |
      [Express API]
            |
        [MongoDB]
      (Upstash Redis optional - rate limit)
```