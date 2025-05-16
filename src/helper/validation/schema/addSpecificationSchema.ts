import * as Yup from "yup";
import { ErrorMessages } from "../../../error/ErrorMessages";

export const addSpecificationSchema = (lang: string) =>
  Yup.object({
    title: Yup.string()
      .required(ErrorMessages.generateErrorMessage("Title", "required", lang))
      .min(3, ErrorMessages.generateErrorMessage("Title", "min", lang)),

    type: Yup.string()
      .required(ErrorMessages.generateErrorMessage("Type", "required", lang)),

    entity: Yup.string()
      .oneOf(["car", "property"], ErrorMessages.generateErrorMessage("Entity", "invalid", lang))
      .required(ErrorMessages.generateErrorMessage("Entity", "required", lang)),

  });
