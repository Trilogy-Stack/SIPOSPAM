// Custom class error untuk menyertakan HTTP status code
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Wrapper fungsi async agar error otomatis diteruskan ke errorHandler
export const wrap = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};