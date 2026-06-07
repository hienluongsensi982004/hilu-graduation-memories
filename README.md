# Thiệp Mời Tốt Nghiệp 🎓

Một thiệp mời tốt nghiệp dạng web tĩnh — chạy được hoàn toàn trên GitHub Pages, không cần backend.

## Cấu trúc 6 trang

1. **Trang chủ** — thiệp đóng, chạm để mở (lật → tự động chuyển đến Trang 3).
2. **Hành trình 4 năm** — timeline ảnh năm 1 → năm 4.
3. **Thiệp mời chi tiết** — tên, thời gian, địa điểm, trang phục.
4. **Đếm ngược** — đến ngày `2026-06-27 08:00`.
5. **Bản đồ** — Hội trường H1, ĐH Thương Mại (Leaflet + OpenStreetMap).
6. **Lời chúc** — form nhập, lưu vào `localStorage`, xuất ra Excel (`.xlsx`).

## Tuỳ biến

Mở [index.html](index.html) và [script.js](script.js):

| Cần đổi | Vị trí |
|---|---|
| Tên người tốt nghiệp | `index.html` — tìm `Hiền Lương` |
| Thời gian, địa điểm | `index.html` — Trang 3 (`.invite-info`) |
| Ngày đếm ngược | `script.js` — biến `TARGET_DATE` |
| Toạ độ bản đồ | `script.js` — biến `WTM_LOCATION` |

## Thay ảnh năm 1 → năm 4

Bỏ ảnh vào thư mục [images/](images/) với đúng tên:

```
images/year1.jpg
images/year2.jpg
images/year3.jpg
images/year4.jpg
```

Nếu chưa có ảnh, các ô sẽ hiện placeholder "📷 Thêm ảnh vào /images" — không bị lỗi.

## Xem thử trên máy

Mở `index.html` trực tiếp trong trình duyệt là chạy được. Nếu muốn dev server:

```powershell
# Python (đa số máy đã có)
python -m http.server 5500
# rồi mở http://localhost:5500
```

## Deploy lên GitHub Pages

1. Tạo repo mới trên GitHub (ví dụ `graduation-invitation`).
2. Push toàn bộ thư mục này lên repo:

   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<username>/graduation-invitation.git
   git push -u origin main
   ```

3. Trên GitHub: **Settings → Pages → Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` / `(root)` → **Save**

4. Đợi ~1 phút, link sẽ là:
   ```
   https://<username>.github.io/graduation-invitation/
   ```

> Mẹo: nếu muốn link gọn `https://<username>.github.io/`, hãy đặt tên repo là `<username>.github.io`.

## Tích hợp Google Sheets — gom lời chúc về một chỗ

Mặc định, lời chúc lưu trong `localStorage` của khách (mỗi máy 1 bản). Để **mọi lời chúc tự ghi thẳng vào Google Sheet của bạn**, làm theo 5 bước:

### 1. Tạo Google Sheet

- Vào https://sheets.google.com → tạo sheet mới (ví dụ tên `Lời chúc tốt nghiệp`).
- Copy **SHEET_ID** từ URL — phần giữa `/d/` và `/edit`:

  ```
  https://docs.google.com/spreadsheets/d/1qFFgHt1FW1MEJwrdwYWyXD-4S1N0661ZxfCqqP9rnsI/edit?gid=0#gid=0
                                       └────────── SHEET_ID ──────────┘
  ```

### 2. Tạo Apps Script

- Vào https://script.google.com → **New project**.
- Xoá nội dung mẫu, dán toàn bộ [apps-script/Code.gs](apps-script/Code.gs).
- Sửa dòng `const SHEET_ID = '...'` thành SHEET_ID vừa copy.
- Bấm 💾 **Save**.

### 3. Deploy thành Web App

- Bấm **Deploy → New deployment**.
- Icon ⚙ bên trái tiêu đề → chọn **Web app**.
- Cấu hình:
  - **Description**: `Graduation wishes endpoint`
  - **Execute as**: `Me (your-email@gmail.com)`
  - **Who has access**: `Anyone` ← quan trọng, để khách không cần đăng nhập
- Bấm **Deploy** → Google sẽ hỏi quyền lần đầu → **Authorize**.
- Copy **Web app URL** (dạng `https://script.google.com/macros/s/AKfy.../exec`).

### 4. Dán URL vào trang web

Mở [script.js](script.js), tìm dòng:

```js
const WEBHOOK_URL = '';
```

Đổi thành:

```js
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfy.../exec';
```

### 5. Test

- Mở `index.html`, qua Trang 6, gửi thử một lời chúc.
- Sang Sheet — sẽ thấy dòng mới với cột: Thời gian, Họ tên, Quan hệ, Tham dự, Email, Lời chúc, User-Agent.
- Tab `LoiChuc` được tự tạo lần đầu nếu chưa có.

### Chi tiết hành vi

- **Lưu kép**: lời chúc luôn được lưu vào `localStorage` *trước*, rồi mới gửi lên Google Sheet. Mất mạng cũng không mất lời chúc — khách bấm "📥 Tải Excel" vẫn có file đầy đủ.
- **Khi sửa Apps Script**: phải bấm **Deploy → Manage deployments → ✏ → Version: New version → Deploy** để URL có hiệu lực bản mới (URL không đổi).
- **Bảo mật**: endpoint là public, ai biết URL đều POST được. Apps Script cắt độ dài chuỗi (`name ≤ 120`, `message ≤ 2000`...) để chống spam phá Sheet.

### Vẫn dùng được không cần Apps Script

Nếu để `WEBHOOK_URL = ''`, mọi thứ vẫn chạy: lời chúc lưu trên máy khách, khách tự bấm "Tải Excel" rồi gửi cho bạn. Hai chế độ tương thích lẫn nhau.

## Thư viện dùng (qua CDN)

- [Leaflet 1.9.4](https://leafletjs.com/) — bản đồ
- [SheetJS xlsx 0.18.5](https://github.com/SheetJS/sheetjs) — xuất Excel
- Google Fonts: Cormorant Garamond, Dancing Script, Quicksand

Không cần `npm install`, không build step.
