# Bio CBG — Content Backend

Express + Mongoose API powering the **Blog** and **Case Study** sections of the
Bio CBG site, plus the admin panel that manages both.

Structurally this mirrors the SIACC blog-admin backend (same auth, upload and
CRUD patterns) with one addition: a second, parallel `CaseStudy` resource next
to `Blog`, sharing the same rich-content block schema so the admin panel's
section/block editor works identically for both.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in the values below
npm run dev            # nodemon, http://localhost:5000
```

### `.env` values

| Var | Notes |
|---|---|
| `MONGODB_URI` | Local Mongo or an Atlas connection string. Not shared with any other project — use your own. |
| `JWT_SECRET` | Any long random string. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used once by the seed route below. |
| `CLOUDINARY_*` | Free tier at cloudinary.com. Only needed for the admin panel's image **upload** button — pasting an image URL directly always works without it. |

### Create the first admin login

With the server running:

```bash
curl -X POST http://localhost:5000/api/auth/seed
```

This reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env` and creates one
superadmin. Log in at `/admin/login` on the frontend, then remove/disable the
`/api/auth/seed` route before deploying to production.

## API shape

Two resources, identical shape:

```
GET    /api/blogs/published            public list (published only)
GET    /api/blogs/public/all-slugs     every published slug (for SSG)
GET    /api/blogs/public/:slug         public detail (+view increment)
GET    /api/blogs                      admin list (auth) — ?page&limit&status&tag&search
GET    /api/blogs/stats                admin dashboard stats (auth)
GET    /api/blogs/:id                  admin single, by id or slug (auth)
POST   /api/blogs                      create (auth)
PUT    /api/blogs/:id                  update (auth)
PATCH  /api/blogs/:id/status           toggle draft/published (auth)
PATCH  /api/blogs/:id/featured         toggle featured (auth)
DELETE /api/blogs/:id                  delete (auth)
POST   /api/blogs/bulk                 { action: publish|draft|delete, ids: [] } (auth)
```

Swap `/blogs` → `/case-studies` for the exact same set of endpoints on the
case-study resource — `sector` replaces `tag` as the filter field.

```
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/change-password
POST   /api/auth/seed                  dev only — see above

POST   /api/upload/image               multipart "image" field (auth)
DELETE /api/upload/:filename           Cloudinary public_id, URL-encoded (auth)
```

## Content shape

Both `Blog` and `CaseStudy` share the same rich body format so the admin
panel's editor works the same for either:

```js
sections: [
  { id: "overview", heading: "Overview", content: [
    { type: "p", text: "…" },
    { type: "h3", text: "…" },
    { type: "ul", items: ["…", "…"] },
    { type: "callout", text: "…" },       // or "callout-warn"
    { type: "steps", stepItems: [{ n: "1", title: "…", desc: "…", tip: "…" }] },
    { type: "img", src: "…", alt: "…" },
  ]},
]
```

`CaseStudy` additionally carries `results: [{ value, label, tone }]` — the
three stat plinths shown on the homepage case-study teaser and the detail
page hero (`tone` is `"leaf"` or `"blush"`, matching the site's two brand
colours).
