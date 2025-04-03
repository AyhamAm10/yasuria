const imageMimeTypes = ["image/jpeg" , 'image/gif' ,"image/png", "image/jpg"];

export const imageFilter = (req, file, cb) => {
    if (imageMimeTypes.includes(file.mimetype)) {
      cb(null, true); 
    } else {
      cb(new Error("Only image files are allowed!"), false); 
    }
  };
