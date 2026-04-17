/**
 * Get accurate current time. Relies on our server time rather than the client
 * time.
 * @param {boolean} fallbackToLocal - If true then falls back to local time in
 * case of error.
 */
async function getCurrentDateTime(fallbackToLocal = false) {
  try {
    const response = await fetch('/health_check');
    const date = response.headers.get('date');
    if (date) {
      return new Date(date).getTime();
    } else {
      // In case there is no date header. Can happen only on dev server
      return Date.now();
    }
  } catch (error) {
    if (fallbackToLocal) {
      return Date.now();
    } else {
      throw error;
    }
  }
}

export default {
  getCurrentTime: getCurrentDateTime,
};
