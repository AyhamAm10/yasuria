export class Environment {
  static _environment = process.env.NODE_ENV!.trim()|| 'development';

  static isDevelopment(): boolean {
    return this._environment == 'development';
  }

  static isProduction() {
    return this._environment == 'production';
  }

  static isTest() {
    return this._environment == 'test';
  }

  static toString() {
    return this._environment;
  }
}
