import { Request, Response, Router } from "express";

import { imageUrl } from "../helper/handle-generate-url";
import { upload } from "../middleware/uploadProfile";

const ImageRouter = Router();

function getImageUrl(filename: string) {
  return imageUrl(filename);
}

ImageRouter.post(
  "/upload",
  upload.array("images", 5),
  (req: Request, res: Response): void => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({ message: "No files uploaded" });
        return;
      }

      const imageUrls = files.map((file) => getImageUrl(file.filename));

      res.json({
        message: "Images uploaded successfully",
        urls: imageUrls,
      });
    } catch (error) {
      res.status(500).json({ message: "Error uploading images" });
    }
  }
);

export default ImageRouter;
