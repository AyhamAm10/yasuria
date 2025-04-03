import * as Yup from "yup";
import { ErrorMessages } from "../../../error/ErrorMessages";

export const getRegisterSchema = (lang: string) =>
  Yup.object({
    name: Yup.string()
      .required(ErrorMessages.generateErrorMessage("Name", "required", lang))
      .min(3, ErrorMessages.generateErrorMessage("Name", "min", lang)),

    phone: Yup.string()
      .required(ErrorMessages.generateErrorMessage("Phone", "required", lang))
      .matches(/^09\d{8}$/, ErrorMessages.generateErrorMessage("Phone", "invalid", lang)),

    password: Yup.string()
      .required(ErrorMessages.generateErrorMessage("Password", "required", lang))
      .min(8, ErrorMessages.generateErrorMessage("Password", "min", lang)),

    role: Yup.string()
      .required(ErrorMessages.generateErrorMessage("Role", "required", lang))
      .oneOf(["user", "vendor"], ErrorMessages.generateErrorMessage("Role", "invalid", lang)),
  });
