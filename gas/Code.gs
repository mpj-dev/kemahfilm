const MAX_FILE_BYTES = 5 * 1024 * 1024;
const THROTTLE_SECONDS = 10 * 60;
const EVENT_YEAR = "2026";
const SHEET_NAME = "REGISTRATIONS";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const HEADERS = [
  "timestamp",
  "registration_id",
  "nama",
  "asal_pesantren",
  "alamat_pesantren",
  "whatsapp",
  "kemampuan",
  "tingkat_kemampuan",
  "pengalaman_produksi",
  "kendala_produksi",
  "motivasi",
  "link_karya",
  "surat_delegasi_url",
  "bukti_pembayaran_url",
  "agreement",
  "registration_status",
  "payment_status",
  "review_status",
  "voucher_status",
  "admin_notes",
  "source",
  "user_agent",
];

function doGet() {
  try {
    const backend = ensureBackend();
    return jsonResponse({
      ok: true,
      message: "Backend Kemah Film MPJ siap.",
      spreadsheet_id: backend.spreadsheet.getId(),
      drive_folder_id: backend.rootFolder.getId(),
    });
  } catch (error) {
    console.error(error);
    return jsonResponse({
      ok: false,
      error: "Backend belum siap.",
    });
  }
}

function doPost(event) {
  try {
    if (!event || !event.postData || !event.postData.contents) {
      throw new Error("Request tidak valid.");
    }

    const payload = JSON.parse(event.postData.contents);
    const registration = validatePayload(payload);

    if (registration.website) {
      throw new Error("Pendaftaran tidak dapat diproses.");
    }

    const backend = ensureBackend();

    throttle(registration.whatsapp);

    const registrationId = createRegistrationId();

    const delegationUrl = saveFile(
      backend.delegationFolder,
      registrationId,
      "surat-delegasi",
      registration.surat_delegasi_file
    );

    const paymentUrl = saveFile(
      backend.paymentFolder,
      registrationId,
      "bukti-pembayaran",
      registration.bukti_pembayaran_file
    );

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      backend.sheet.appendRow([
        new Date(),
        registrationId,
        registration.nama,
        registration.asal_pesantren,
        registration.alamat_pesantren,
        registration.whatsapp,
        registration.kemampuan,
        registration.tingkat_kemampuan,
        registration.pengalaman_produksi,
        registration.kendala_produksi,
        registration.motivasi,
        registration.link_karya,
        delegationUrl,
        paymentUrl,
        registration.agreement,
        "SUBMITTED",
        "WAITING_VERIFICATION",
        "UNDER_REVIEW",
        "",
        "",
        registration.source,
        registration.user_agent,
      ]);
    } finally {
      lock.releaseLock();
    }

    return jsonResponse({
      ok: true,
      registration_id: registrationId,
    });
  } catch (error) {
    console.error(error);
    return jsonResponse({
      ok: false,
      error: error.message || "Pendaftaran gagal diproses.",
    });
  }
}

function ensureBackend() {
  const properties = PropertiesService.getScriptProperties();

  let spreadsheetId = properties.getProperty("SPREADSHEET_ID");
  let driveFolderId = properties.getProperty("DRIVE_FOLDER_ID");

  let spreadsheet;

  if (spreadsheetId) {
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  } else {
    spreadsheet = SpreadsheetApp.create("Kemah Film MPJ 2026 - Registrasi Peserta");
    spreadsheetId = spreadsheet.getId();
    properties.setProperty("SPREADSHEET_ID", spreadsheetId);
  }

  let rootFolder;

  if (driveFolderId) {
    rootFolder = DriveApp.getFolderById(driveFolderId);
  } else {
    rootFolder = DriveApp.createFolder("Kemah Film MPJ 2026 - Registrasi");
    driveFolderId = rootFolder.getId();
    properties.setProperty("DRIVE_FOLDER_ID", driveFolderId);
  }

  const sheet = ensureSheet(spreadsheet);
  const delegationFolder = ensureSubfolder(rootFolder, "Surat Delegasi");
  const paymentFolder = ensureSubfolder(rootFolder, "Bukti Pembayaran");

  return {
    spreadsheet,
    rootFolder,
    sheet,
    delegationFolder,
    paymentFolder,
  };
}

function ensureSheet(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeader = firstRow.some(function (value) {
    return String(value || "").trim() !== "";
  });

  if (!hasHeader) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, HEADERS.length);
  }

  return sheet;
}

function ensureSubfolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);

  if (folders.hasNext()) {
    return folders.next();
  }

  return parentFolder.createFolder(folderName);
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload tidak valid.");
  }

  const requiredTextFields = [
    "nama",
    "asal_pesantren",
    "alamat_pesantren",
    "whatsapp",
    "kemampuan",
    "tingkat_kemampuan",
    "pengalaman_produksi",
    "kendala_produksi",
    "motivasi",
    "link_karya",
  ];

  requiredTextFields.forEach(function (field) {
    if (typeof payload[field] !== "string" || !payload[field].trim()) {
      throw new Error("Data pendaftaran belum lengkap.");
    }
  });

  const whatsapp = normalizeWhatsapp(payload.whatsapp);

  if (whatsapp.length < 10) {
    throw new Error("Nomor WhatsApp tidak valid.");
  }

  if (!/^https?:\/\//i.test(payload.link_karya.trim())) {
    throw new Error("Link karya tidak valid.");
  }

  if (payload.pengalaman_produksi.trim().length < 50) {
    throw new Error("Pengalaman produksi terlalu singkat.");
  }

  if (payload.kendala_produksi.trim().length < 30) {
    throw new Error("Kendala produksi terlalu singkat.");
  }

  if (payload.motivasi.trim().length < 50) {
    throw new Error("Motivasi terlalu singkat.");
  }

  if (payload.agreement !== true) {
    throw new Error("Persetujuan peserta wajib diberikan.");
  }

  validateFile(payload.surat_delegasi_file);
  validateFile(payload.bukti_pembayaran_file);

  return {
    nama: payload.nama.trim(),
    asal_pesantren: payload.asal_pesantren.trim(),
    alamat_pesantren: payload.alamat_pesantren.trim(),
    whatsapp,
    kemampuan: payload.kemampuan.trim(),
    tingkat_kemampuan: payload.tingkat_kemampuan.trim(),
    pengalaman_produksi: payload.pengalaman_produksi.trim(),
    kendala_produksi: payload.kendala_produksi.trim(),
    motivasi: payload.motivasi.trim(),
    link_karya: payload.link_karya.trim(),
    surat_delegasi_file: payload.surat_delegasi_file,
    bukti_pembayaran_file: payload.bukti_pembayaran_file,
    agreement: true,
    website: typeof payload.website === "string" ? payload.website.trim() : "",
    source: typeof payload.source === "string" ? payload.source.trim() : "",
    user_agent: typeof payload.user_agent === "string" ? payload.user_agent.trim() : "",
  };
}

function normalizeWhatsapp(value) {
  let number = String(value || "").replace(/\D/g, "");

  if (number.indexOf("0") === 0) {
    number = "62" + number.slice(1);
  }

  if (number.indexOf("620") === 0) {
    number = "62" + number.slice(3);
  }

  return number;
}

function validateFile(file) {
  if (
    !file ||
    typeof file.name !== "string" ||
    typeof file.type !== "string" ||
    typeof file.data !== "string"
  ) {
    throw new Error("Berkas pendaftaran belum lengkap.");
  }

  if (ALLOWED_MIME_TYPES.indexOf(file.type) === -1) {
    throw new Error("Format berkas harus PDF, JPG, JPEG, atau PNG.");
  }

  const base64 = normalizeBase64(file.data);
  const estimatedBytes = Math.floor(base64.length * 3 / 4);

  if (estimatedBytes <= 0) {
    throw new Error("Berkas tidak boleh kosong.");
  }

  if (estimatedBytes > MAX_FILE_BYTES) {
    throw new Error("Ukuran setiap berkas maksimal 5 MB.");
  }
}

function normalizeBase64(data) {
  const value = String(data || "");

  if (value.indexOf(",") !== -1) {
    return value.split(",").pop();
  }

  return value;
}

function throttle(whatsapp) {
  const cache = CacheService.getScriptCache();
  const key = "registration:" + whatsapp;

  if (cache.get(key)) {
    throw new Error("Pendaftaran dengan nomor WhatsApp ini baru saja dikirim. Coba lagi dalam 10 menit.");
  }

  cache.put(key, "1", THROTTLE_SECONDS);
}

function saveFile(folder, registrationId, label, file) {
  const extension = getExtension(file.type);
  const base64 = normalizeBase64(file.data);
  const bytes = Utilities.base64Decode(base64);

  if (bytes.length > MAX_FILE_BYTES) {
    throw new Error("Ukuran setiap berkas maksimal 5 MB.");
  }

  const safeName = registrationId + "-" + label + "." + extension;
  const blob = Utilities.newBlob(bytes, file.type, safeName);
  const createdFile = folder.createFile(blob);

  return createdFile.getUrl();
}

function getExtension(mimeType) {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/jpeg") return "jpg";

  throw new Error("Format berkas tidak didukung.");
}

function createRegistrationId() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const properties = PropertiesService.getScriptProperties();
    const key = "REGISTRATION_COUNTER_" + EVENT_YEAR;
    const current = Number(properties.getProperty(key) || "0");
    const next = current + 1;

    properties.setProperty(key, String(next));

    return "KF-MPJ-" + EVENT_YEAR + "-" + String(next).padStart(4, "0");
  } finally {
    lock.releaseLock();
  }
}

function jsonResponse(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}