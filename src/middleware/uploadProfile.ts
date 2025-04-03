import multer from "multer";

const imageMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

// handle storge
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const iconStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/public/icons/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// add filter 
const imageFilter = (req, file, cb) => {
    console.log("File received:", file.originalname, file.mimetype);
  if (imageMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Only image files are allowed!"), false); // Reject the file
  }
};

// upload img middleware
export const uploadIcon = multer({
  storage: iconStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const upload = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});


