import * as Yup from "yup";
import { ErrorMessages } from "../../../error/ErrorMessages";

export const addServiceSchema = (lang: string) =>
  Yup.object({
    title: Yup.string()
      .required(ErrorMessages.generateErrorMessage("title", "required", lang))
      .min(3, ErrorMessages.generateErrorMessage("title", "min", lang)),

    description: Yup.string()
      .required(ErrorMessages.generateErrorMessage("description", "required", lang)),

    location: Yup.string()
      .required(ErrorMessages.generateErrorMessage("location", "required", lang)),

    type: Yup.string()
      .oneOf(["cars", "properties"], ErrorMessages.generateErrorMessage("Type", "invalid", lang))
      .required(ErrorMessages.generateErrorMessage("type", "required", lang)),

    category_id: Yup.number()
      .nullable()
      .positive(ErrorMessages.generateErrorMessage("category", "invalid", lang))
      .integer(ErrorMessages.generateErrorMessage("category", "invalid", lang)),

    broker_office: Yup.array()
      .nullable()
      .of(
        Yup.number()
          .positive(ErrorMessages.generateErrorMessage("broker_office", "invalid", lang))
          .integer(ErrorMessages.generateErrorMessage("broker_office", "invalid", lang))
      ),
  });