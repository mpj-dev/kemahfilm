# Google Apps Script Backend

Backend ini menerima pendaftaran dari form, menyimpan berkas ke Google Drive,
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
Surat delegasi wajib untuk peserta delegasi dan opsional untuk Peserta Umum.
Nomor WhatsApp yang sama hanya dapat mengirim satu kali dalam 10 menit.

## Validasi Pembayaran

Frontend mengirim status delegasi, snapshot rekening, kategori biaya, kode unik,
dan total transfer. GAS menghitung ulang kategori dan nominal sebelum menyimpan
data. Peserta dengan surat delegasi mendapat tarif gelombang otomatis berdasarkan
tanggal WIB: Gelombang 1 sebelum 15 Juni 2026, Gelombang 2 pada 15–25 Juni 2026,
dan Gelombang 3 / OTS mulai 26 Juni 2026. Peserta tanpa surat delegasi otomatis
memakai kategori Peserta Umum.

Kode unik berasal dari tiga digit terakhir WhatsApp peserta. Jika hasilnya
`000`, kode diubah menjadi `111`.

Untuk menguji validasi backend pada tanggal tertentu, isi `TEST_PAYMENT_DATE`
di `Code.gs` dengan format `YYYY-MM-DD`, misalnya `"2026-06-10"`. Kosongkan
kembali konstanta tersebut sebelum deploy produksi.

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

## Menu Admin di Google Sheets

Project Apps Script harus terikat ke spreadsheet melalui
`Extensions > Apps Script`. Setelah memperbarui `Code.gs`, reload spreadsheet
agar menu `Kemah Film Admin` muncul. Penggunaan pertama kali dapat meminta
otorisasi akun Google admin.

Untuk ACC pembayaran:

1. Buka tab `REGISTRATIONS`.
2. Klik salah satu sel pada row peserta berstatus `WAITING_ADMIN_APPROVAL`.
3. Pilih `Kemah Film Admin > ACC Pembayaran Peserta Terpilih`.
4. Pastikan alert sukses menampilkan nomor pendaftaran dan ID resmi peserta.

Untuk menolak pembayaran:

1. Buka tab `REGISTRATIONS`.
2. Klik salah satu sel pada row peserta berstatus `WAITING_ADMIN_APPROVAL`.
3. Pilih `Kemah Film Admin > Tolak Pembayaran Peserta Terpilih`.
4. Isi alasan penolakan lalu klik `OK`.

Pemanggilan manual `approvePayment()` dan `rejectPayment()` dari editor Apps
Script tetap tersedia sebagai fallback.
