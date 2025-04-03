import * as Yup from "yup";
import { ErrorMessages } from "../../../error/ErrorMessages";

export const addPropertySchema = (lang: string) =>
  Yup.object({
    title_ar: Yup.string()
      .required(
        ErrorMessages.generateErrorMessage("Title (Arabic)", "required", lang)
      )
      .min(
        3,
        ErrorMessages.generateErrorMessage("Title (Arabic)", "min", lang)
      ),

    desc_ar: Yup.string()
      .required(
        ErrorMessages.generateErrorMessage(
          "Description (Arabic)",
          "required",
          lang
        )
      )
      .min(
        10,
        ErrorMessages.generateErrorMessage("Description (Arabic)", "min", lang)
      ),

    isActive: Yup.boolean(),

    location: Yup.string().required(
      ErrorMessages.generateErrorMessage("Location", "required", lang)
    ),

    status: Yup.string()
      .required(ErrorMessages.generateErrorMessage("Status", "required", lang))
      .oneOf(
        ["new", "used"],
        ErrorMessages.generateErrorMessage("Status", "invalid", lang)
      ),

    price: Yup.number()
      .required(ErrorMessages.generateErrorMessage("Price", "required", lang))
      .positive(ErrorMessages.generateErrorMessage("Price", "invalid", lang)),

    area: Yup.string()
      .required(ErrorMessages.generateErrorMessage("Area", "required", lang))
      .min(1, ErrorMessages.generateErrorMessage("Area", "min", lang)),

    lat: Yup.number()
      .nullable()
      .positive(
        ErrorMessages.generateErrorMessage("Latitude", "invalid", lang)
      ),

    long: Yup.number()
      .nullable()
      .positive(
        ErrorMessages.generateErrorMessage("Longitude", "invalid", lang)
      ),
  });
