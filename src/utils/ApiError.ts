/**
 * Lớp lỗi (Error) tùy chỉnh để trả về mã
 * trạng thái HTTP (statusCode) cụ thể.
 * Service sẽ throw lỗi này, và middleware
 * error.ts sẽ bắt và xử lý nó.
 */
export class ApiError extends Error {
  statusCode: number;
  errors?: any; // Thêm trường optional để chứa lỗi validation

  constructor(statusCode: number, message: string, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    // Giữ stack trace
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}