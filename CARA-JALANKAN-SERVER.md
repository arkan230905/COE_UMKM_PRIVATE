# 🚀 CARA JALANKAN SERVER WEB

## ✅ SERVER SUDAH JALAN!

Server development sudah otomatis berjalan di:

```
http://localhost:3000
atau
http://127.0.0.1:3000
```

---

## 📋 CARA AKSES WEB

### 1. Buka Browser
- Chrome
- Firefox
- Edge
- Atau browser apapun

### 2. Ketik URL di Address Bar:
```
http://localhost:3000
```

Atau:
```
http://127.0.0.1:3000
```

### 3. Tekan Enter

Web akan terbuka!

---

## 🔄 JIKA SERVER MATI / BERHENTI

### Cara 1: Jalankan dari Terminal

**Windows CMD:**
```cmd
cd C:\SIUPIN-SISTEMUMKMPINTAR
npm run dev
```

**Windows PowerShell:**
```powershell
cd C:\SIUPIN-SISTEMUMKMPINTAR
npm run dev
```

### Cara 2: Jalankan dari VS Code

1. Buka VS Code
2. Buka folder project: `C:\SIUPIN-SISTEMUMKMPINTAR`
3. Buka Terminal (Ctrl + `)
4. Ketik:
   ```
   npm run dev
   ```
5. Tekan Enter

---

## ⚙️ PERINTAH PENTING

### Jalankan Development Server
```bash
npm run dev
```

Server akan jalan di: `http://localhost:3000`

### Stop Server
Tekan: **Ctrl + C** di terminal

### Build untuk Production
```bash
npm run build
```

Hasil build ada di folder: `dist/`

### Preview Build Production
```bash
npm run preview
```

---

## 🔍 CEK SERVER SUDAH JALAN?

### Cara 1: Cek di Browser
Buka: `http://localhost:3000`

Jika muncul halaman web → Server jalan ✅
Jika error "Can't connect" → Server mati ❌

### Cara 2: Cek di Terminal
Terminal akan menampilkan:
```
  VITE v6.2.3  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
  ➜  press h + enter to show help
```

---

## 🐛 TROUBLESHOOTING

### Problem 1: "Port 3000 sudah digunakan"

**Error:**
```
Port 3000 is already in use
```

**Solusi A: Matikan process lain di port 3000**
1. Buka Task Manager (Ctrl + Shift + Esc)
2. Cari process "Node.js" atau "npm"
3. Klik kanan → End Task

**Solusi B: Gunakan port lain**
Edit file `package.json`, ubah:
```json
"dev": "vite --port=3000 --host=0.0.0.0"
```
Menjadi:
```json
"dev": "vite --port=3001 --host=0.0.0.0"
```

Lalu akses: `http://localhost:3001`

---

### Problem 2: "npm: command not found"

**Penyebab:** Node.js belum terinstall

**Solusi:**
1. Download Node.js dari: https://nodejs.org/
2. Install (versi LTS recommended)
3. Restart terminal
4. Jalankan lagi: `npm run dev`

---

### Problem 3: "Module not found"

**Error:**
```
Error: Cannot find module 'xxx'
```

**Solusi: Install dependencies**
```bash
npm install
```

Lalu jalankan lagi:
```bash
npm run dev
```

---

## 📱 AKSES DARI HP / DEVICE LAIN

### Cara 1: Cek IP Address
Di terminal saat server jalan, lihat:
```
➜  Network: http://192.168.1.100:3000/
```

### Cara 2: Akses dari HP
1. Pastikan HP dan Laptop di WiFi yang sama
2. Buka browser di HP
3. Ketik IP dari terminal, misal:
   ```
   http://192.168.1.100:3000
   ```
4. Enter

---

## 🚀 DEPLOY KE HOSTING

### Build untuk Production
```bash
npm run build
```

Hasil build ada di folder: `dist/`

### Upload ke Hosting
1. Zip folder `dist/`
2. Upload ke hosting (Vercel, Netlify, Hostinger, dll)
3. Arahkan domain ke folder tersebut

### Recommended Hosting:
- **Vercel** (Free, recommended untuk React)
- **Netlify** (Free)
- **GitHub Pages** (Free)
- **Hostinger** (Paid)

---

## 📝 NOTES

### Hot Module Replacement (HMR)
Saat server jalan, setiap perubahan kode akan otomatis reload di browser. Tidak perlu restart server!

### Development vs Production
- **Development** (`npm run dev`): Untuk coding, ada debug tools
- **Production** (`npm run build`): Untuk deploy, optimized & compressed

---

## ✅ QUICK START

Singkatnya, jalankan 2 perintah ini:

```bash
cd C:\SIUPIN-SISTEMUMKMPINTAR
npm run dev
```

Lalu buka browser: `http://localhost:3000`

**SELESAI!** 🎉

---

## 📞 SUPPORT

Jika ada error:
1. Screenshot error di terminal
2. Screenshot error di browser console (F12)
3. Cek versi Node.js: `node --version`
4. Cek versi npm: `npm --version`

---

**Happy Coding!** 🚀
