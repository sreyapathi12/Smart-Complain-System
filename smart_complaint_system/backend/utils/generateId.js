/* ============================================
   GENERATE ID.JS — ID Generation Helpers
   ============================================ */

/**
 * Generate a sequential Complaint ID in format GRV-YYYY-XXXX
 * @param {number} currentCount - current number of complaints in DB
 * @returns {string}
 */
function generateComplaintId(currentCount = 0) {
  const year = new Date().getFullYear();
  const next = String(currentCount + 1).padStart(4, '0');
  return `GRV-${year}-${next}`;
}

/**
 * Generate a Citizen ID in format CITxxx
 * @param {number} currentCount
 * @returns {string}
 */
function generateCitizenId(currentCount = 0) {
  return `CIT${String(currentCount + 1).padStart(3, '0')}`;
}

/**
 * Generate a unique remark ID
 * @returns {string}
 */
function generateRemarkId() {
  return `RMK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

module.exports = { generateComplaintId, generateCitizenId, generateRemarkId };
