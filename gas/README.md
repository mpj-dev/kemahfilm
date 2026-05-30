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
