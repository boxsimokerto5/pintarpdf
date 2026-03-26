# Panduan Build APK PintarPDF via GitHub Actions

Proyek ini telah dikonfigurasi untuk membangun (build) file APK secara otomatis menggunakan GitHub Actions.

## Persiapan di GitHub

Agar build berjalan lancar, Anda perlu melakukan beberapa langkah di repositori GitHub Anda:

1.  **Push Kode ke GitHub**: Pastikan semua file (termasuk folder `.github`) sudah di-push ke cabang `main` atau `master`.
2.  **Jalankan Workflow**:
    *   Buka tab **Actions** di GitHub.
    *   Pilih workflow **Build Android APK**.
    *   Klik **Run workflow** (jika ingin menjalankan manual) atau push kode baru untuk memicu build otomatis.

## Hasil Build (Artifacts)

Setelah proses selesai (sekitar 5-10 menit), Anda dapat mengunduh file APK di bagian **Artifacts** pada halaman detail build:
*   **PintarPDF-Debug**: APK versi debug (bisa langsung diinstal di HP untuk testing).
*   **PintarPDF-Release-Unsigned**: APK versi release tapi belum ditandatangani (perlu ditandatangani sebelum bisa diupload ke Play Store).

## Catatan Penting

*   **Keystore**: Workflow saat ini menghasilkan APK *unsigned* untuk versi release. Jika Anda ingin APK yang siap rilis (signed), Anda perlu menambahkan `ANDROID_KEYSTORE` di GitHub Secrets dan memperbarui file workflow.
*   **Versi Node & Java**: Workflow menggunakan Node.js 20 dan Java JDK 17 untuk kompatibilitas terbaik dengan Capacitor terbaru.

## Perintah Lokal

Jika Anda ingin mencoba build di komputer lokal:
```bash
npm run android:build
```
*Pastikan Anda sudah menginstal Android Studio dan SDK yang diperlukan.*
