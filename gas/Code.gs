const MAX_FILE_BYTES = 5 * 1024 * 1024;
const THROTTLE_SECONDS = 10 * 60;
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents);
    const registration = validatePayload(payload);

    if (registration.website) {
      throw new Error("Pendaftaran tidak dapat diproses.");
    }

    throttle(registration.whatsapp);

    const properties = PropertiesService.getScriptProperties();
    const spreadsheetId = properties.getProperty("SPREADSHEET_ID");
    const driveFolderId = properties.getProperty("DRIVE_FOLDER_ID");
    if (!spreadsheetId || !driveFolderId) {
      throw new Error("Konfigurasi backend belum lengkap.");
    }

    const registrationId = createRegistrationId();
    const folder = DriveApp.getFolderById(driveFolderId);
    const delegationUrl = saveFile(folder, registrationId, "surat-delegasi", registration.surat_delegasi_file);
    const paymentUrl = saveFile(folder, registrationId, "bukti-pembayaran", registration.bukti_pembayaran_file);

    const sheet = SpreadsheetApp.openById(spreadsheetId).getSheets()[0];
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet.appendRow([
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
        registration.source,
        registration.user_agent,
      ]);
    } finally {
      lock.releaseLock();
    }

    return jsonResponse({ ok: true, registration_id: registrationId });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: error.message || "Pendaftaran gagal diproses." });
  }
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

  const whatsapp = payload.whatsapp.replace(/\D/g, "");
  if (whatsapp.length < 10) throw new Error("Nomor WhatsApp tidak valid.");
  if (!/^https?:\/\//i.test(payload.link_karya)) throw new Error("Link karya tidak valid.");
  if (payload.pengalaman_produksi.trim().length < 50) throw new Error("Pengalaman produksi terlalu singkat.");
  if (payload.kendala_produksi.trim().length < 30) throw new Error("Kendala produksi terlalu singkat.");
  if (payload.motivasi.trim().length < 50) throw new Error("Motivasi terlalu singkat.");
  if (payload.agreement !== true) throw new Error("Persetujuan peserta wajib diberikan.");

  validateFile(payload.surat_delegasi_file);
  validateFile(payload.bukti_pembayaran_file);

  return Object.assign({}, payload, {
    whatsapp: whatsapp,
    website: typeof payload.website === "string" ? payload.website.trim() : "",
    source: typeof payload.source === "string" ? payload.source : "",
    user_agent: typeof payload.user_agent === "string" ? payload.user_agent : "",
  });
}

function validateFile(file) {
  if (!file || typeof file.name !== "string" || typeof file.type !== "string" || typeof file.data !== "string") {
    throw new Error("Berkas pendaftaran belum lengkap.");
  }
  if (ALLOWED_MIME_TYPES.indexOf(file.type) === -1) {
    throw new Error("Format berkas harus PDF, JPG, atau PNG.");
  }

  const estimatedBytes = Math.floor(file.data.length * 3 / 4);
  if (estimatedBytes > MAX_FILE_BYTES) {
    throw new Error("Ukuran setiap berkas maksimal 5 MB.");
  }
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
  const extension = file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : "jpg";
  const bytes = Utilities.base64Decode(file.data);
  const blob = Utilities.newBlob(bytes, file.type, registrationId + "-" + label + "." + extension);
  return folder.createFile(blob).getUrl();
}

function createRegistrationId() {
  const stamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyyMMdd");
  const suffix = Utilities.getUuid().replace(/-/g, "").slice(0, 6).toUpperCase();
  return "KFMPJ-" + stamp + "-" + suffix;
}

function jsonResponse(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
