class BaseError extends Error {
    public readonly message: string;
    public readonly description?: string;
    public readonly code?: number;
    public readonly httpCode: HttpStatusCode;
  
    constructor(
      httpCode: HttpStatusCode,
      message: string,
      code: number,
      description: string,
    ) {
      super(message);
      Object.setPrototypeOf(this, new.target.prototype);
  
      this.message = message;
      this.httpCode = httpCode;
  
      if (description) {
        this.description = description;
      }
  
      if (code) {
        this.code = code;
      }
  
      Error.captureStackTrace(this);
    }
  }
  
  //free to extend the BaseError
  export class APIError extends BaseError {
    constructor(
      httpCode = HttpStatusCode.INTERNAL_SERVER,
      message: string,
      code?: number,
      description?: string,
    ) {
      super(httpCode, message, code!, description!);
    }
  }
  
  export enum HttpStatusCode {
    OK = 200,
    OK_CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    UNPROCESS_ENTITY = 422,
    INTERNAL_SERVER = 500,
  }
  