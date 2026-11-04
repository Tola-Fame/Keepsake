# Keepsake

A website for making photo albums: birthdays, weddings, vacations, babies, graduations, anniversaries, family and holidays. People upload photos, design pages from templates or from scratch, and download a print-ready PDF or print directly.

**Setting it up? Read [SETUP-GUIDE.md](SETUP-GUIDE.md).** It's a step-by-step guide with no coding.

Planned features (including free and paid versions) are in [ROADMAP.md](ROADMAP.md).

## Features

- 24 templates across 10 occasions, each with its own colors, fonts, frames and stickers
- Drag-and-drop editor: 17 page layouts; move, resize, rotate and crop photos; undo/redo
- Text with 11 fonts, 31 stickers, shapes, solid/gradient/pattern backgrounds
- Photo filters: black & white, sepia, brightness, contrast
- Page sizes: 8×8, 10×10, 12×12 in, US Letter and A4 (portrait or landscape)
- Export: 300 DPI PDF, JPG page images (zip), or print from the browser
- No account needed: albums are saved in the browser (IndexedDB)
- With an account (Google or email link): albums saved online, share links, guest photo uploads, viewer PDF download
- Help & FAQ page, privacy policy and terms pages
- Works on phones, tablets and desktops

## How it runs

- Next.js (App Router) + TypeScript + Tailwind CSS, deployed on Vercel
- Konva canvas renders pages in the editor and for export, so output matches the screen
- Auth.js (Google + Resend magic links), Drizzle ORM on Postgres (Neon, or any Postgres)
- Photos go straight from the browser to Vercel Blob. They are resized to at most 3000 px before upload.
- Database migrations run automatically during each Vercel build when `DATABASE_URL` is set

Without any environment variables, the site runs in browser-only mode. See `.env.example` for every setting.

## Local development

```bash
npm install
npm run dev
```
