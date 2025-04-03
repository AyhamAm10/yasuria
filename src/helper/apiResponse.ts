export class ApiResponse {
    static success(data: any, message: string = "Success", pagination?: object) {
      return {
        success: true,
        message,
        data,
        ...(pagination && { pagination }),
      };
    }
  
    static error(message: string, statusCode: number = 500, errors?: any) {
      return {
        success: false,
        message,
        statusCode,
        ...(errors && { errors }),
      };
    }
  }
  