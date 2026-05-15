export class ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;

  constructor(data: T, message = 'success', code = 200) {
    this.code = code;
    this.message = message;
    this.data = data;
  }

  static success<T>(data: T, message = 'success'): ApiResponse<T> {
    return new ApiResponse(data, message, 200);
  }

  static error(message: string, code = 400): ApiResponse<null> {
    return new ApiResponse(null, message, code);
  }
}
