import * as Yup from "yup";
import { ErrorMessages } from "../../../error/ErrorMessages";

export const getLoginSchema = (lang: string) =>
  Yup.object({
    phone: Yup.string()
      .required(ErrorMessages.generateErrorMessage("Phone", "required", lang))
      .matches(/^09\d{8}$/, ErrorMessages.generateErrorMessage("Phone", "invalid", lang)),
  });
