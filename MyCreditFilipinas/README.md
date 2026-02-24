# MyCredit Filipinas

A full-stack lending management system built for **MyCredit Filipinas**, a lending company based in Davao City, Philippines. Built with **Next.js**, **MySQL/MariaDB**, and **Tailwind CSS**.

## Features

### For Borrowers
- **Account registration** with personal details
- **Loan application** — choose type, purpose, amount (₱5K–₱30K), and term
- **Built-in loan calculator** — see monthly payments, interest, and totals before applying
- **Payment submission** — submit payments via Cash, GCash, Bank Transfer, Maya, or Check
- **Dashboard** — view loan status, payment history, and outstanding balance
- **Profile** — view personal information

### For Admin / Staff
- **Loan management** — review, approve, or deny loan applications with a reason
- **Payment verification** — verify or reject borrower-submitted payments
- **User management** — view detailed borrower profiles, addresses, references, and loan history
- **Staff directory** — view admin and approver accounts
- **Overview dashboard** — system-wide statistics at a glance

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | MySQL / MariaDB |
| Auth | JWT (jose) + bcryptjs |
| Deployment | Vercel / any Node.js host |

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MySQL** or **MariaDB** (XAMPP works great for local development)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/mycredit-filipinas.git
cd mycredit-filipinas/MyCreditFilipinas
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

1. Create a database called `mycreditfilipinas_database` in your MySQL/MariaDB server
2. Import the schema:
   ```bash
   mysql -u root mycreditfilipinas_database < mycredit_filipinas.sql
   ```
   Or import `mycredit_filipinas.sql` via **phpMyAdmin**.

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your database credentials. **Important:** Change the `JWT_SECRET` to a random string for production.

### 5. Seed sample data

```bash
node seed.js
```

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes (auth, loans, payments, users, staff)
│   ├── admin/         # Admin panel pages
│   ├── dashboard/     # Borrower dashboard pages
│   ├── login/         # Login page
│   ├── signup/        # Registration page
│   └── page.tsx       # Landing page
├── components/        # Shared UI components (Navbar, Sidebar, MobileNav)
├── lib/
│   ├── auth.ts        # JWT & password utilities
│   └── db.ts          # MySQL connection pool
└── middleware.ts       # Route protection & role-based access
```

## Production Deployment

1. Set all environment variables on your hosting platform
2. Use a strong, random `JWT_SECRET`
3. Use a managed MySQL service (PlanetScale, Neon, AWS RDS, etc.)
4. Run `npm run build` and `npm start`

## License

Private — MyCredit Filipinas. All rights reserved.
