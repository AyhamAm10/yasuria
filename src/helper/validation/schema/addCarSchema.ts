import * as Yup from "yup";
import { ErrorMessages } from "../../../error/ErrorMessages";

export const addCarSchema = (lang: string) =>
  Yup.object({
    title_ar: Yup.string()
      .required(ErrorMessages.generateErrorMessage("Title (Arabic)", "required", lang))
      .min(3, ErrorMessages.generateErrorMessage("Title (Arabic)", "min", lang)),

    desc_ar: Yup.string()
      .required(ErrorMessages.generateErrorMessage("Description (Arabic)", "required", lang))
      .min(10, ErrorMessages.generateErrorMessage("Description (Arabic)", "min", lang)),

    model: Yup.string()
      .required(ErrorMessages.generateErrorMessage("Model", "required", lang)),

    brand: Yup.string()
      .required(ErrorMessages.generateErrorMessage("Brand", "required", lang)),

    location: Yup.string()
      .required(ErrorMessages.generateErrorMessage("Location", "required", lang)),

    price: Yup.number()
      .required(ErrorMessages.generateErrorMessage("Price", "required", lang))
      .positive(ErrorMessages.generateErrorMessage("Price", "invalid", lang)),

    lat: Yup.number()
      .nullable()
      .positive(ErrorMessages.generateErrorMessage("Latitude", "invalid", lang)),

    long: Yup.number()
      .nullable()
      .positive(ErrorMessages.generateErrorMessage("Longitude", "invalid", lang)),

    images: Yup.array()
      .of(Yup.string().url(ErrorMessages.generateErrorMessage("Image", "invalid", lang)))
      .nullable(),
  });
