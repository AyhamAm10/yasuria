// import i18next from 'i18next';
// import fs from 'fs';
// import path from 'path';
// import Backend from 'i18next-fs-backend'; 
// import LanguageDetector from 'i18next-browser-languagedetector';
// import { Request, Response, NextFunction } from 'express';
// import i18nextMiddleware from 'i18next-express-middleware';

// i18next
//   .use(Backend)
//   .use(LanguageDetector)
//   .use(i18nextMiddleware)
//   .init({
//     fallbackLng: 'ar',
//     preload: ['en', 'ar'],
//     backend: {
//       loadPath: path.join(__dirname, '/locales/{{lng}}.json'),
//     },
//     debug: true,
//   });

// // استخدام middleware بشكل مباشر
// export const i18nMiddleware = i18nextMiddleware.init(i18next);
