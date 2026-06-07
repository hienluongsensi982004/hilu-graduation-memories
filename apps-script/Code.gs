/**
 * Graduation Invitation — Google Apps Script Web App
 *
 * Nhận lời chúc từ thiệp mời và ghi vào Google Sheet.
 * Triển khai dạng "Web App" → ai có link cũng gọi được (anonymous).
 *
 * Cách dùng (xem README.md mục "Tích hợp Google Sheets"):
 *   1. Mở https://script.google.com → New project → dán toàn bộ file này
 *   2. Sửa SHEET_ID bên dưới (lấy từ URL Sheet của bạn)
 *   3. Deploy → New deployment → type "Web app"
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   4. Copy Web app URL → dán vào CONFIG.WEBHOOK_URL trong script.js
 */

// ====== EDIT THIS ======
const SHEET_ID = 'PASTE_YOUR_SHEET_ID_HERE';   // ID giữa /d/ và /edit trong URL Sheet
const SHEET_NAME = 'LoiChuc';                  // tên tab trong Sheet
// =======================

const HEADERS = [
  'Thời gian',
  'Họ và tên',
  'Quan hệ',
  'Tham dự',
  'Email',
  'Lời chúc',
  'IP',
  'User-Agent'
];

function getSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function clean_(s, max) {
  if (s == null) return '';
  s = String(s).trim();
  if (max && s.length > max) s = s.slice(0, max);
  return s;
}

/** GET → quick health check (also used to count entries) */
function doGet(e) {
  try {
    const sheet = getSheet_();
    return jsonOut_({ ok: true, count: Math.max(0, sheet.getLastRow() - 1) });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

/** POST → write a wish row */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try { payload = JSON.parse(e.postData.contents); }
      catch (_) { payload = e.parameter || {}; }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const name    = clean_(payload.name, 120);
    const message = clean_(payload.message, 2000);
    if (!name || !message) {
      return jsonOut_({ ok: false, error: 'Thiếu họ tên hoặc lời chúc.' });
    }

    const row = [
      new Date(),
      name,
      clean_(payload.relation, 40),
      clean_(payload.attend, 40),
      clean_(payload.email, 160),
      message,
      '',                                       // IP — Apps Script không expose, để trống
      clean_(payload.userAgent, 240)
    ];

    getSheet_().appendRow(row);
    return jsonOut_({ ok: true });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}
