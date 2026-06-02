const MAX_FILE_BYTES = 5 * 1024 * 1024;
const THROTTLE_SECONDS = 10 * 60;
const EVENT_YEAR = "2026";
const SHEET_NAME = "REGISTRATIONS";
const WAITING_PAYMENT_STATUS = "WAITING_ADMIN_APPROVAL";
// TEST_PAYMENT_DATE hanya untuk testing dan wajib dikosongkan sebelum produksi.
const TEST_PAYMENT_DATE = "";

const PAYMENT_TIERS = {
  WAVE_1: 285000,
  WAVE_2: 335000,
  WAVE_3_OTS: 400000,
  GENERAL: 1000000,
};

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const REGIONAL_OPTIONS = [
  "Regional Dapil IV",
  "Regional Situbondo-Bondowoso",
  "Regional SidoPas",
  "Regional Banyuwangi",
  "Regional Malang Raya",
  "Regional Blitar",
  "Regional Ojo Lamban",
  "Regional Jombang",
  "Regional Kediri",
  "Regional Nganjuk",
  "Regional Plat AE",
  "Regional Madura",
  "Regional Tulungagung-Trenggalek",
  "Regional Mojokerto",
  "Regional Probolinggo",
  "Regional SBY-GRESIK",
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
  "payment_tier",
  "payment_base_amount",
  "payment_unique_code",
  "payment_total_amount",
  "payment_bank_name",
  "payment_account_number",
  "payment_account_holder",
  "payment_reviewed_at",
  "payment_reviewed_by",
  "official_participant_id",
  "delegation_status",
  "delegation_type",
  "regional",
  "community_name",
];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Kemah Film Admin")
    .addItem("ACC Pembayaran Peserta Terpilih", "approveSelectedPayment")
    .addItem("Tolak Pembayaran Peserta Terpilih", "rejectSelectedPayment")
    .addToUi();
}

function approveSelectedPayment() {
  const ui = SpreadsheetApp.getUi();

  try {
    const selected = getSelectedRegistration();
    const result = JSON.parse(approvePayment(selected.registrationId, getActiveAdminName()));

    ui.alert(
      "Pembayaran Berhasil Di-ACC",
      "Nomor pendaftaran: " +
        result.registration_id +
        "\nID resmi peserta: " +
        result.official_participant_id,
      ui.ButtonSet.OK,
    );
  } catch (error) {
    showAdminError(error);
  }
}

function rejectSelectedPayment() {
  const ui = SpreadsheetApp.getUi();

  try {
    const selected = getSelectedRegistration();
    const prompt = ui.prompt(
      "Tolak Pembayaran Peserta",
      "Masukkan alasan penolakan untuk " + selected.registrationId + ":",
      ui.ButtonSet.OK_CANCEL,
    );

    if (prompt.getSelectedButton() !== ui.Button.OK) return;

    const reason = prompt.getResponseText().trim();
    if (!reason) {
      ui.alert("Pembayaran tidak ditolak", "Alasan penolakan wajib diisi.", ui.ButtonSet.OK);
      return;
    }

    const result = JSON.parse(
      rejectPayment(selected.registrationId, getActiveAdminName(), reason),
    );

    ui.alert(
      "Pembayaran Berhasil Ditolak",
      "Nomor pendaftaran: " + result.registration_id,
      ui.ButtonSet.OK,
    );
  } catch (error) {
    showAdminError(error);
  }
}

function getSelectedRegistration() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet && sheet.getActiveRange();

  if (!sheet || sheet.getName() !== SHEET_NAME) {
    throw new Error("Pilih row peserta pada sheet " + SHEET_NAME + ".");
  }

  if (!range || range.getRow() <= 1) {
    throw new Error("Pilih salah satu row peserta, bukan header.");
  }

  const headers = getHeaderMap(sheet);
  if (!headers.registration_id) {
    throw new Error("Header sheet belum lengkap: registration_id");
  }
  if (!headers.payment_status) {
    throw new Error("Header sheet belum lengkap: payment_status");
  }

  const registrationId = String(
    getRowValue(sheet, range.getRow(), headers, "registration_id") || "",
  ).trim();
  if (!registrationId) {
    throw new Error("Row terpilih tidak memiliki nomor pendaftaran.");
  }

  const paymentStatus = String(
    getRowValue(sheet, range.getRow(), headers, "payment_status") || "",
  ).trim();
  if (paymentStatus !== WAITING_PAYMENT_STATUS) {
    throw new Error("Pembayaran sudah memiliki keputusan final atau belum siap diproses.");
  }

  return { registrationId };
}

function getActiveAdminName() {
  const email = Session.getActiveUser().getEmail();
  return email ? email.trim() : "Admin";
}

function showAdminError(error) {
  SpreadsheetApp.getUi().alert(
    "Aksi Gagal",
    error && error.message ? error.message : "Terjadi kesalahan saat memproses pembayaran.",
    SpreadsheetApp.getUi().ButtonSet.OK,
  );
}

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

    const delegationUrl = registration.surat_delegasi_file
      ? saveFile(
          backend.delegationFolder,
          registrationId,
          "surat-delegasi",
          registration.surat_delegasi_file,
        )
      : "";

    const paymentUrl = saveFile(
      backend.paymentFolder,
      registrationId,
      "bukti-pembayaran",
      registration.bukti_pembayaran_file,
    );

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      appendRegistration(backend.sheet, {
        timestamp: new Date(),
        registration_id: registrationId,
        nama: registration.nama,
        asal_pesantren: registration.asal_pesantren,
        alamat_pesantren: registration.alamat_pesantren,
        whatsapp: registration.whatsapp,
        kemampuan: registration.kemampuan,
        tingkat_kemampuan: registration.tingkat_kemampuan,
        pengalaman_produksi: registration.pengalaman_produksi,
        kendala_produksi: registration.kendala_produksi,
        motivasi: registration.motivasi,
        link_karya: registration.link_karya,
        surat_delegasi_url: delegationUrl,
        bukti_pembayaran_url: paymentUrl,
        agreement: registration.agreement,
        registration_status: "SUBMITTED",
        payment_status: WAITING_PAYMENT_STATUS,
        review_status: "UNDER_REVIEW",
        voucher_status: "",
        admin_notes: "",
        source: registration.source,
        user_agent: registration.user_agent,
        payment_tier: registration.payment_tier,
        payment_base_amount: registration.payment_base_amount,
        payment_unique_code: registration.payment_unique_code,
        payment_total_amount: registration.payment_total_amount,
        payment_bank_name: registration.payment_bank_name,
        payment_account_number: registration.payment_account_number,
        payment_account_holder: registration.payment_account_holder,
        payment_reviewed_at: "",
        payment_reviewed_by: "",
        official_participant_id: "",
        delegation_status: registration.delegation_status,
        delegation_type: registration.delegation_type,
        regional: registration.regional,
        community_name: registration.community_name,
      });
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

  const firstRow = getSheetHeaders(sheet);
  const hasHeader = firstRow.some(function (value) {
    return String(value || "").trim() !== "";
  });

  if (!hasHeader) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, HEADERS.length);
  } else {
    const existingHeaders = {};
    firstRow.forEach(function (header) {
      existingHeaders[String(header || "").trim()] = true;
    });

    const missingHeaders = HEADERS.filter(function (header) {
      return !existingHeaders[header];
    });

    if (missingHeaders.length) {
      sheet.getRange(1, firstRow.length + 1, 1, missingHeaders.length).setValues([missingHeaders]);
      sheet.autoResizeColumns(firstRow.length + 1, missingHeaders.length);
    }
  }

  return sheet;
}

function getSheetHeaders(sheet) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
}

function getHeaderMap(sheet) {
  const map = {};

  getSheetHeaders(sheet).forEach(function (header, index) {
    const name = String(header || "").trim();
    if (name) map[name] = index + 1;
  });

  return map;
}

function appendRegistration(sheet, registration) {
  const row = getSheetHeaders(sheet).map(function (header) {
    const name = String(header || "").trim();
    const value = Object.prototype.hasOwnProperty.call(registration, name)
      ? registration[name]
      : "";
    return sanitizeSheetValue(value);
  });

  sheet.appendRow(row);
}

function sanitizeSheetValue(value) {
  if (typeof value !== "string") return value;
  return /^[=+\-@]/.test(value) ? "'" + value : value;
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

  const delegationType = validateDelegationType(payload.delegation_type);
  const delegationStatus = getLegacyDelegationStatus(delegationType);
  const regional = normalizeOptionalText(payload.regional);
  const communityName = normalizeOptionalText(payload.community_name);

  if (delegationType === "MPJ_REGIONAL" && !regional) {
    throw new Error("Asal regional wajib dipilih untuk peserta dari Pesantren (MPJ).");
  }

  if (regional && REGIONAL_OPTIONS.indexOf(regional) === -1) {
    throw new Error("Asal regional tidak valid.");
  }

  if (delegationType === "OTHER_COMMUNITY" && !communityName) {
    throw new Error("Nama komunitas media pesantren wajib diisi.");
  }

  const hasRequiredDelegationFile =
    delegationType === "MPJ_REGIONAL" || delegationType === "OTHER_COMMUNITY";

  if (hasRequiredDelegationFile && !payload.surat_delegasi_file) {
    throw new Error("Surat delegasi wajib diunggah.");
  }

  const payment = validatePayment(payload, whatsapp, delegationType);

  if (payload.surat_delegasi_file) {
    validateFile(payload.surat_delegasi_file);
  }
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
    delegation_status: delegationStatus,
    delegation_type: delegationType,
    regional,
    community_name: communityName,
    surat_delegasi_file: payload.surat_delegasi_file,
    bukti_pembayaran_file: payload.bukti_pembayaran_file,
    agreement: true,
    website: typeof payload.website === "string" ? payload.website.trim() : "",
    payment_tier: payment.tier,
    payment_base_amount: payment.baseAmount,
    payment_unique_code: payment.uniqueCode,
    payment_total_amount: payment.totalAmount,
    payment_bank_name: payment.bankName,
    payment_account_number: payment.accountNumber,
    payment_account_holder: payment.accountHolder,
    source: typeof payload.source === "string" ? payload.source.trim() : "",
    user_agent: typeof payload.user_agent === "string" ? payload.user_agent.trim() : "",
  };
}

function validateDelegationType(value) {
  const type = typeof value === "string" ? value.trim() : "";
  if (type !== "MPJ_REGIONAL" && type !== "OTHER_COMMUNITY" && type !== "NO_DELEGATION") {
    throw new Error("Status delegasi tidak valid.");
  }
  return type;
}

function getLegacyDelegationStatus(delegationType) {
  return delegationType === "NO_DELEGATION" ? "NO_DELEGATION" : "HAS_DELEGATION";
}

function normalizeOptionalText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validatePayment(payload, whatsapp, delegationType) {
  const tier = typeof payload.payment_tier === "string" ? payload.payment_tier.trim() : "";
  const baseAmount = Number(payload.payment_base_amount);
  const uniqueCode = Number(payload.payment_unique_code);
  const totalAmount = Number(payload.payment_total_amount);
  const bankName = validatePaymentAccountValue(payload.payment_bank_name);
  const accountNumber = validatePaymentAccountValue(payload.payment_account_number);
  const accountHolder = validatePaymentAccountValue(payload.payment_account_holder);

  const expectedTier = getCurrentPaymentTier(delegationType);

  if (tier !== expectedTier) {
    throw new Error("Kategori pembayaran tidak valid.");
  }

  if (!Number.isInteger(baseAmount) || baseAmount !== PAYMENT_TIERS[tier]) {
    throw new Error("Biaya pendaftaran tidak valid.");
  }

  if (!Number.isInteger(uniqueCode) || uniqueCode < 1 || uniqueCode > 999) {
    throw new Error("Kode unik pembayaran tidak valid.");
  }

  if (uniqueCode !== createPaymentUniqueCode(whatsapp)) {
    throw new Error("Kode unik pembayaran tidak sesuai.");
  }

  if (!Number.isInteger(totalAmount) || totalAmount !== baseAmount + uniqueCode) {
    throw new Error("Total pembayaran tidak valid.");
  }

  if (payload.payment_status !== WAITING_PAYMENT_STATUS) {
    throw new Error("Status pembayaran tidak valid.");
  }

  return {
    tier,
    baseAmount,
    uniqueCode,
    totalAmount,
    bankName,
    accountNumber,
    accountHolder,
  };
}

function getCurrentPaymentTier(delegationType) {
  if (delegationType === "NO_DELEGATION") return "GENERAL";

  const jakartaDate = getJakartaPaymentDate();
  if (jakartaDate >= "2026-06-26") return "WAVE_3_OTS";
  if (jakartaDate >= "2026-06-15") return "WAVE_2";
  return "WAVE_1";
}

function getJakartaPaymentDate() {
  if (TEST_PAYMENT_DATE) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(TEST_PAYMENT_DATE)) {
      throw new Error("TEST_PAYMENT_DATE harus menggunakan format YYYY-MM-DD.");
    }
    return TEST_PAYMENT_DATE;
  }
  return Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd");
}

function validatePaymentAccountValue(value) {
  const normalized = typeof value === "string" ? value.trim() : "";

  if (!normalized || normalized.indexOf("ISI_") === 0) {
    throw new Error("Informasi rekening belum dikonfigurasi.");
  }

  return normalized;
}

function createPaymentUniqueCode(whatsapp) {
  const digits = String(whatsapp || "").replace(/\D/g, "");
  const code = Number(digits.slice(-3));
  return code === 0 ? 111 : code;
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
  const estimatedBytes = Math.floor((base64.length * 3) / 4);

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
    throw new Error(
      "Pendaftaran dengan nomor WhatsApp ini baru saja dikirim. Coba lagi dalam 10 menit.",
    );
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

function approvePayment(registrationId, adminName) {
  const reviewer = requireAdminText(adminName, "Nama admin wajib diisi.");
  const backend = ensureBackend();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const headers = getHeaderMap(backend.sheet);
    requireAdminHeaders(headers);
    const row = findRegistrationRow(backend.sheet, headers, registrationId);

    if (getRowValue(backend.sheet, row, headers, "payment_status") !== WAITING_PAYMENT_STATUS) {
      throw new Error("Pembayaran sudah memiliki keputusan final.");
    }

    validateStoredPayment(backend.sheet, row, headers);

    let officialParticipantId = getRowValue(backend.sheet, row, headers, "official_participant_id");

    if (!officialParticipantId) {
      officialParticipantId = createOfficialParticipantId();
    }

    setRowValue(backend.sheet, row, headers, "payment_status", "APPROVED");
    setRowValue(backend.sheet, row, headers, "registration_status", "CONFIRMED");
    setRowValue(backend.sheet, row, headers, "payment_reviewed_at", new Date());
    setRowValue(backend.sheet, row, headers, "payment_reviewed_by", reviewer);
    setRowValue(backend.sheet, row, headers, "official_participant_id", officialParticipantId);

    return logAdminResult({
      ok: true,
      registration_id: registrationId,
      payment_status: "APPROVED",
      registration_status: "CONFIRMED",
      official_participant_id: officialParticipantId,
    });
  } finally {
    lock.releaseLock();
  }
}

function rejectPayment(registrationId, adminName, reason) {
  const reviewer = requireAdminText(adminName, "Nama admin wajib diisi.");
  const notes = requireAdminText(reason, "Alasan penolakan wajib diisi.");
  const backend = ensureBackend();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const headers = getHeaderMap(backend.sheet);
    requireAdminHeaders(headers);
    const row = findRegistrationRow(backend.sheet, headers, registrationId);

    if (getRowValue(backend.sheet, row, headers, "payment_status") !== WAITING_PAYMENT_STATUS) {
      throw new Error("Pembayaran sudah memiliki keputusan final.");
    }

    setRowValue(backend.sheet, row, headers, "payment_status", "REJECTED");
    setRowValue(backend.sheet, row, headers, "registration_status", "PAYMENT_REJECTED");
    setRowValue(backend.sheet, row, headers, "payment_reviewed_at", new Date());
    setRowValue(backend.sheet, row, headers, "payment_reviewed_by", reviewer);
    setRowValue(backend.sheet, row, headers, "admin_notes", notes);

    return logAdminResult({
      ok: true,
      registration_id: registrationId,
      payment_status: "REJECTED",
      registration_status: "PAYMENT_REJECTED",
    });
  } finally {
    lock.releaseLock();
  }
}

function requireAdminHeaders(headers) {
  [
    "registration_id",
    "registration_status",
    "payment_status",
    "payment_base_amount",
    "payment_unique_code",
    "payment_total_amount",
    "payment_reviewed_at",
    "payment_reviewed_by",
    "official_participant_id",
    "admin_notes",
  ].forEach(function (header) {
    if (!headers[header]) throw new Error("Header sheet belum lengkap: " + header);
  });
}

function findRegistrationRow(sheet, headers, registrationId) {
  const id = requireAdminText(registrationId, "Nomor pendaftaran wajib diisi.");
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) throw new Error("Data pendaftaran belum tersedia.");

  const values = sheet.getRange(2, headers.registration_id, lastRow - 1, 1).getValues();

  for (let index = 0; index < values.length; index += 1) {
    if (String(values[index][0]).trim() === id) return index + 2;
  }

  throw new Error("Nomor pendaftaran tidak ditemukan.");
}

function validateStoredPayment(sheet, row, headers) {
  const baseAmount = Number(getRowValue(sheet, row, headers, "payment_base_amount"));
  const uniqueCode = Number(getRowValue(sheet, row, headers, "payment_unique_code"));
  const totalAmount = Number(getRowValue(sheet, row, headers, "payment_total_amount"));

  if (
    !Number.isInteger(baseAmount) ||
    !Number.isInteger(uniqueCode) ||
    uniqueCode < 1 ||
    uniqueCode > 999 ||
    !Number.isInteger(totalAmount) ||
    totalAmount !== baseAmount + uniqueCode
  ) {
    throw new Error("Data nominal pembayaran belum lengkap atau tidak valid.");
  }
}

function getRowValue(sheet, row, headers, header) {
  return sheet.getRange(row, headers[header]).getValue();
}

function setRowValue(sheet, row, headers, header, value) {
  sheet.getRange(row, headers[header]).setValue(sanitizeSheetValue(value));
}

function requireAdminText(value, message) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) throw new Error(message);
  return normalized;
}

function createOfficialParticipantId() {
  const properties = PropertiesService.getScriptProperties();
  const key = "OFFICIAL_PARTICIPANT_COUNTER_" + EVENT_YEAR;
  const current = Number(properties.getProperty(key) || "0");
  const next = current + 1;

  properties.setProperty(key, String(next));

  return "KFM-" + EVENT_YEAR + "-" + String(next).padStart(4, "0");
}

function logAdminResult(body) {
  const result = JSON.stringify(body);
  console.log(result);
  return result;
}

function jsonResponse(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
