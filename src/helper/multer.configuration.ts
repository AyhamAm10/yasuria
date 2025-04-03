import multer from "multer";
import { imageFilter } from "./fileFilters";
import { APIError, HttpStatusCode } from "../error/api.error";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const uploadPicture = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// export const upload = multer({
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, "uploads/");
//     },
//     filename: (req, file, cb) => {
//       cb(null, `${Date.now()}-${file.originalname}`);
//     },
//   }),
//   fileFilter: (req, file, cb) => {
//     if (!file.mimetype.startsWith("image/")) {
//       const error = new Error("Only image files are allowed") as any;  
//       error.httpCode = HttpStatusCode.BAD_REQUEST; 
//       return cb(error, false);
//     }
//     cb(null, true);
//   },
//   limits: { fileSize: 5 * 1024 * 1024 },
// }).array("variation_images");
 
export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "src/public/uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      const error = new Error("Only image files are allowed") as any;
      error.httpCode = HttpStatusCode.BAD_REQUEST;
      return cb(error, false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: "main_image", maxCount: 3 }, 
  { name: "variation_images", maxCount: 10 }, 
]);


