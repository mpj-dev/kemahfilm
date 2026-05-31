# Kemah Film MPJ 2026

Microsite pendaftaran Kemah Film MPJ 2026 menggunakan TanStack Start, React,
Tailwind CSS, Vercel, dan Google Apps Script.

## Menjalankan Lokal

```sh
npm install
cp .env.example .env
npm run dev
```

Isi `VITE_GAS_ENDPOINT` dengan URL Web app Google Apps Script. Jika env tersebut
belum diisi pada development, form memakai ID mock lokal agar alur UI tetap
dapat diuji. Production tanpa endpoint akan menampilkan error konfigurasi.

## Pemeriksaan

```sh
npm run lint
npm run build
```

## Deploy Vercel

1. Push repository ke Git provider lalu import repository tersebut di Vercel.
2. Gunakan build command `npm run build`. Vercel akan menjalankan `npm install`
   berdasarkan `package-lock.json`.
3. Tambahkan environment variable `VITE_GAS_ENDPOINT` untuk Production dan
   Preview dengan URL Web app Google Apps Script `/exec`.
4. Deploy lalu uji URL `*.vercel.app` yang diberikan Vercel.
5. Buka Project Settings -> Domains dan tambahkan
   `kemahfilm.mediapondokjatim.id`.
6. Di DNS IDCloud, tambahkan record `CNAME` dengan host `kemahfilm` dan target
   persis yang ditampilkan Vercel. Target umumnya berupa domain
   `*.vercel-dns-*.com`; gunakan nilai dari dashboard Vercel jika berbeda.
7. Tunggu verifikasi DNS dan penerbitan SSL otomatis selesai.

Setup penerima data formulir berada di [`gas/README.md`](gas/README.md).

## Konfigurasi Pembayaran

Sebelum membuka pendaftaran ke publik, ganti placeholder rekening di
[`src/lib/payment.ts`](src/lib/payment.ts):

```ts
bankName: "ISI_NAMA_BANK",
accountNumber: "ISI_NOMOR_REKENING",
accountHolder: "ISI_NAMA_PENERIMA",
```

Form memblokir submit selama placeholder tersebut belum diganti. Nominal transfer
terdiri dari biaya kategori dan kode unik tiga digit terakhir WhatsApp peserta.
Jika tiga digit terakhir adalah `000`, kode unik diubah menjadi `111`.

Contoh: Gelombang 1 `Rp285.000` dengan kode unik `047` menghasilkan total
transfer `Rp285.047`.

Peserta belum dianggap resmi setelah submit. Admin perlu menyetujui pembayaran
melalui helper Apps Script sebelum `official_participant_id` dibuat.

## Asset Logo

Header menggunakan `src/assets/logo-kemahfilm.png`. Hero organizer dan footer
menggunakan `src/assets/logo-mpj-landscape-putih.png` tanpa label Regional
Malang.

## Smoke Test Produksi

1. Buka landing page dan `/daftar` dari domain produksi.
2. Submit data valid dengan dua file kecil PDF, JPG, atau PNG.
3. Pastikan form redirect ke `/sukses` dan menampilkan ID pendaftaran.
4. Pastikan data masuk ke tab `REGISTRATIONS` di Google Sheets.
5. Pastikan file masuk ke folder Google Drive `Surat Delegasi` dan
   `Bukti Pembayaran`.
6. Submit ulang nomor WhatsApp yang sama dan pastikan throttle 10 menit tampil.
