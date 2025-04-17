// src/validations/requestValidation.ts
import * as Yup from "yup";
import { ErrorMessages } from "../../../error/ErrorMessages"; 

export const getRequestSchema = (lang: string) =>
  Yup.object({
    description: Yup.string()
      .required(ErrorMessages.generateErrorMessage("الوصف", "required", lang)),
    
    budget: Yup.number()
      .required(ErrorMessages.generateErrorMessage("الميزانية", "required", lang))
      .positive(ErrorMessages.generateErrorMessage("الميزانية", "positive", lang)),

    governorate: Yup.string()
      .required(ErrorMessages.generateErrorMessage("المحافظة", "required", lang)),

  });
