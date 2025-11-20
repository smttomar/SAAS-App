# 📹 Cloudinary Video Compressor & Dashboard

A full-stack SaaS-style video compression and management platform built with **Next.js 16**, **Clerk Auth**, **Prisma**, **PostgreSQL**, **Cloudinary**, and **Vercel**.

Users can upload videos, automatically compress them using Cloudinary, preview & play them, download compressed versions, and delete videos (both from Cloudinary & database).  
Includes a clean dashboard UI, sidebar navigation, protected routes, and full authentication system.

---

## 🚀 Features

### 🔐 Authentication

- Login & Signup using Clerk
- Protected routes with middleware
- Auto-redirect based on login state
- Secure logout with redirect

### 🎥 Video Upload & Compression

- Upload high-quality videos
- Auto-compression with Cloudinary
- Save metadata to database:
    - Title
    - Description
    - Duration
    - Original Size
    - Compressed Size
    - Cloudinary Public ID

### ▶️ Video Playback

- Click thumbnail → Full-screen video player
- Background preview video pauses automatically
- Close button fully stops playback

### 📥 Download Video

- Download compressed videos with one click

### 🗑 Delete Video

- Deletes from **Cloudinary**
- Deletes from **Prisma Database**

### 🖥 Dashboard UI

- Sidebar navigation
- User avatar + details
- Logout button
- Modern UI (TailwindCSS + DaisyUI)

---

## 🏗 Tech Stack

| Layer      | Technology                                   |
| ---------- | -------------------------------------------- |
| Frontend   | Next.js 16, TypeScript, TailwindCSS, DaisyUI |
| Auth       | Clerk                                        |
| Storage    | Cloudinary                                   |
| Database   | PostgreSQL                                   |
| ORM        | Prisma 6                                     |
| Deployment | Vercel                                       |

---

## 📂 Project Structure

```
/app
 ├── home/
 ├── video-upload/
 ├── api/
 │    ├── videos/
 │    ├── video-upload/
 │    └── delete-video/
 ├── layout.tsx
 └── page.tsx (redirect)

/components
 ├── VideoCard.tsx
 ├── VideoPlayerModal.tsx
 └── Layout/
      └── AppLayout.tsx

/prisma
 └── schema.prisma

/types
 └── Video.ts
```

---

## ⚙️ Environment Variables

Create `.env` file:

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# PostgreSQL Database
DATABASE_URL=postgresql://username:password@host:5432/dbname
```

---

## 🗄 Prisma Setup

### Generate client

```bash
npx prisma generate
```

### Apply migrations

```bash
npx prisma migrate deploy
```

---

## ▶️ Run Locally

```bash
npm install
npm run dev
```

App will run at:

```
http://localhost:3000
```

---

## 🚀 Deploy to Vercel

### 1. Push project to GitHub

### 2. Import repository on **Vercel**

### 3. Add all environment variables shown above

### 4. Deploy 🚀

Everything builds automatically:

- Next.js app
- Prisma client
- Server routes
- Cloudinary functions

---

## 🧹 Troubleshooting

### ❌ Upload Fails

Cloudinary env variables missing or incorrect.

### ❌ Logout doesn't redirect

Use:

```ts
signOut({ redirectUrl: "/sign-in" });
```

### ❌ Prisma engine error

Make sure you are using:

```prisma
generator client {
  provider = "prisma-client-js"
  engineType = "binary"
}
```

### ❌ 499 Request Timeout

Cloudinary free plan timeout → upgrade or reduce file size.

---

## 🏁 Future Improvements

- Multi-video upload
- Video trimming
- AI thumbnails
- Analytics dashboard
- Cloudflare R2 support

---

## ⭐ Support

If this project helped you, consider giving it a **star ⭐**!
