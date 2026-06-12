# Ethnivaa Backend

Express + Sequelize backend for Ethnivaa.

## Quick start

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

## Email OTP signup with Brevo

Set these environment variables before testing the email flow:

- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`
- `BREVO_SENDER_NAME`
- `GOOGLE_CLIENT_ID` for Google sign-in

Auth flow endpoints:

- `POST /api/auth/signup/start`
- `POST /api/auth/signup/verify`
- `POST /api/auth/signup/complete`
- `POST /api/auth/google`

## Seed data

```bash
npm run seed
```

## Key routes

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/cart/items`
- `POST /api/orders/checkout`
- `GET /api/admin/products`
- `GET /api/admin/orders`

## Docker

```bash
docker compose up --build
```
