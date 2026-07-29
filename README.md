# Engineering Blog Platform

A modern, highly-performant publishing platform built for engineering teams. It features a bespoke "Vast Quiet / Ledger" aesthetic, designed specifically to break out of generic AI defaults and deliver a premium reading experience.

## ✨ Features

- **Premium "Vast Quiet" UI**: Clean, editorial-style typography using *Bodoni Moda* and *Urbanist*, paired with subtle glassmorphism and micro-interactions.
- **Serverless PostgreSQL**: Powered by [Neon](https://neon.tech/) for scalable, low-latency database operations.
- **Full-Stack Next.js (App Router)**: Utilizing React Server Components, Server Actions, and dynamic API routes.
- **Secure Authentication**: Custom JWT/Cookie-based auth system with rigorous password security policies.
- **Rich Markdown Support**: Secure markdown rendering with XSS protection and syntax highlighting.
- **Rate Limiting**: Built-in IP rate limiting to prevent API abuse.

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Neon Tech)
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT & Bcrypt

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech/) PostgreSQL Database URI

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hemanthkumar-d/Blog-Poster.git
   cd Blog-Poster
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and copy the contents from `.env.example`:
   ```env
   # Neon Postgres Connection URL
   DATABASE_URL="postgresql://<user>:<password>@<endpoint>.neon.tech/neondb?sslmode=require"
   
   # Secure JWT Secret Key
   JWT_SECRET="generate_a_secure_random_string"
   ```

4. **Initialize the Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000` to view the application.

## 🏗 Architecture & Project Structure

- **`src/app`**: Next.js App Router, containing all pages and REST API routes (`/api/...`).
- **`src/components`**: Reusable React components (Navbar, PostCards, Pagination, Comments).
- **`src/lib`**: Core utilities, including database singletons, JWT verification, password hashing, and rate limiters.
- **`prisma`**: Database schema (`schema.prisma`) and seeding scripts.

## 🛡 Security

- **Input Validation**: Strict Zod schemas on all incoming API requests.
- **XSS Prevention**: DOMPurify sanitization applied to all markdown rendering.
- **Data Protection**: Bcrypt hashing (cost factor 12) for passwords.
- **Session Security**: HttpOnly, `SameSite=lax` secure cookies for JWT storage.

## 📄 License

This project is licensed under the MIT License.
