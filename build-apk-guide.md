# Panduan Build APK PintarPDF (Versi HP)

Karena Anda menggunakan HP, sistem build telah dikonfigurasi untuk bekerja secara otomatis menggunakan **GitHub Actions**.

## Cara Mendapatkan APK Signed
1. Lakukan **Push** atau simpan perubahan kode ini ke GitHub.
2. Buka tab **Actions** di halaman GitHub repositori Anda.
3. Pilih alur kerja (workflow) yang sedang berjalan (biasanya bernama "Android Build").
4. Tunggu sekitar 5-10 menit sampai selesai (muncul centang hijau).
5. Scroll ke bawah ke bagian **Artifacts**.

## File yang Akan Anda Dapatkan
1. **PintarPDF-Release-Signed**: Download ini untuk mendapatkan file APK yang bisa diinstal di HP Android.
2. **PintarPDF-SIGNING-KEY-DO-NOT-DELETE**: **SANGAT PENTING!** Download file `.keystore` ini dan simpan di Google Drive atau Email. File ini adalah "Kunci" aplikasi Anda. Jika hilang, Anda tidak akan bisa mengupdate aplikasi di masa depan.

## Informasi Kunci (Catat!)
Jika suatu saat Anda ingin build manual atau pindah ke komputer, gunakan data ini:
- **Keystore Password**: `pintarpdf123`
- **Key Alias**: `pintar-pdf`
- **Key Password**: `pintarpdf123`

## Fitur yang Sudah Aktif
- **Izin**: Internet, Kamera, Lokasi, dan Penyimpanan (Baca/Tulis File).
- **Ikon**: Logo PintarPDF baru sudah otomatis terpasang sebagai ikon aplikasi dan splash screen.
- **Optimasi**: Kode sudah diperkecil (minified) agar aplikasi ringan.
