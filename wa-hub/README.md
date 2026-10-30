# WA Hub

Satu aplikasi desktop untuk banyak akun WhatsApp. Setiap akun memakai WhatsApp Web asli
dengan sesi terpisah; Anda login dengan scan QR seperti biasa. Tidak ada library tidak resmi.

## Cara pakai (Windows)

1. Install Node.js LTS dari https://nodejs.org
2. Ekstrak folder ini, buka Command Prompt di dalamnya, lalu jalankan:

       npm install
       npm start

3. Klik **+ Tambah akun**, beri nama, lalu scan QR dari
   WhatsApp di HP: Perangkat tertaut → Tautkan perangkat.
4. Ulangi untuk setiap nomor. Login tersimpan, jadi QR hanya perlu sekali.

## Jadikan file .exe (installer)

    npm run build

Hasilnya ada di folder `dist/` (WA Hub Setup 1.0.0.exe).

## Fitur

- Banyak akun dalam satu jendela, sesi terpisah dan tersimpan permanen
- Semua akun tetap aktif di latar belakang, jadi notifikasi tetap masuk
- Badge jumlah pesan belum dibaca per akun, plus total di judul jendela
- Ctrl+1…9 pindah akun, Ctrl+R muat ulang akun aktif
- Ganti nama / warna akun, hapus akun (sesi ikut terhapus)

## Panel balasan (kanan)

- **Template**: klik untuk mengisi kotak chat akun yang sedang terbuka. Bisa tambah dan hapus template sendiri.
- **Saran AI**: isi API key Anthropic sekali, klik "Buat saran dari chat terakhir", edit drafnya, lalu "Masukkan ke kotak chat".
- Kedua fitur hanya mengisi kotak ketik. Pesan terkirim hanya kalau Anda menekan kirim sendiri.
- Pembacaan chat terakhir bergantung pada struktur halaman WhatsApp Web, jadi bisa berhenti bekerja kalau WhatsApp mengubah tampilannya.

## Catatan

- Satu nomor WhatsApp bisa tertaut ke maksimal 4 perangkat tambahan, jadi aman dipakai bersama WhatsApp Web lain.
- Jangan menambahkan bot atau auto-reply di atas aplikasi ini; itu yang bisa membuat nomor kena banned.
- Untuk Mac, jalankan `npm install` dan `npm start` dengan cara yang sama.
