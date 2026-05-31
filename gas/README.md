# Google Apps Script Backend

Backend ini menerima pendaftaran dari form, menyimpan dua berkas ke Google Drive,
dan menambahkan satu baris ke Google Sheets.

## Setup

1. Buat Google Sheet dan isi header sesuai urutan kolom pada `Code.gs`.
2. Buat folder Google Drive khusus upload pendaftaran.
3. Buat project Apps Script baru lalu salin `Code.gs` dan `appsscript.json`.
4. Tambahkan Script Properties:
   - `SPREADSHEET_ID`
   - `DRIVE_FOLDER_ID`
5. Deploy sebagai Web app dengan akses `Anyone`.
6. Masukkan URL deployment `/exec` ke `VITE_GAS_ENDPOINT`.

Setiap file dibatasi maksimum 5 MB dan hanya menerima PDF, JPG, atau PNG.
Nomor WhatsApp yang sama hanya dapat mengirim satu kali dalam 10 menit.

## Validasi Pembayaran

Frontend mengirim snapshot rekening, kategori biaya, kode unik, dan total
transfer. Kode unik berasal dari tiga digit terakhir WhatsApp peserta. Jika
hasilnya `000`, kode diubah menjadi `111`.

Peserta baru berstatus resmi setelah pembayaran disetujui admin. Jalankan helper
berikut dari editor Apps Script:

```js
approvePayment("KF-MPJ-2026-0002", "Admin Test");
rejectPayment("KF-MPJ-2026-0003", "Admin Test", "Nominal tidak sesuai");
```

`approvePayment()` mengubah status pembayaran menjadi `APPROVED`, status
pendaftaran menjadi `CONFIRMED`, dan membuat `official_participant_id` dengan
format `KFM-2026-0001`.

`rejectPayment()` mengubah status pembayaran menjadi `REJECTED`, status
pendaftaran menjadi `PAYMENT_REJECTED`, serta menyimpan alasan di `admin_notes`.

Helper hanya memproses submission baru dengan status `WAITING_ADMIN_APPROVAL`.
Row lama tanpa nominal pembayaran lengkap ditangani manual.
