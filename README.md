# Kemah Film MPJ 2026

Microsite pendaftaran Kemah Film MPJ 2026 menggunakan TanStack Start, React,
Tailwind CSS, Cloudflare Workers, dan Google Apps Script.

## Menjalankan Lokal

```sh
bun install
cp .env.example .env
bun run dev
```

Isi `VITE_GAS_ENDPOINT` dengan URL Web app Google Apps Script. Jika env tersebut
belum diisi, form memakai ID mock lokal agar alur UI tetap dapat diuji.

## Pemeriksaan

```sh
bun run lint
bun run build
```

## Deploy Cloudflare Workers

```sh
bunx wrangler login
bun run deploy
```

Konfigurasi Workers berada di `wrangler.jsonc`. Setup penerima data formulir
berada di [`gas/README.md`](gas/README.md).
