import * as Yup from "yup";
import { ErrorMessages } from "../../../error/ErrorMessages";

export const brokerOfficeSchema = (lang: string, isUpdate = false) => {
  const baseSchema = Yup.object().shape({
    phone: Yup.string()
      .required(ErrorMessages.generateErrorMessage("Phone", "required", lang))
      .matches(
        /^09\d{8}$/,
        ErrorMessages.generateErrorMessage("Phone", "invalid", lang)
      ),
    office_name: Yup.string()
      .required(
        ErrorMessages.generateErrorMessage("Office name", "required", lang)
      )
      .min(3, ErrorMessages.generateErrorMessage("Office name", "min", lang)),
    commercial_number: Yup.string().required(
      ErrorMessages.generateErrorMessage("Commercial number", "required", lang)
    ),
    whatsapp_number: Yup.string()
      .required(
        ErrorMessages.generateErrorMessage("WhatsApp number", "required", lang)
      )
      .matches(
        /^09\d{8}$/,
        ErrorMessages.generateErrorMessage("WhatsApp number", "invalid", lang)
      ),
    governorate_id: Yup.number().required(
      ErrorMessages.generateErrorMessage("Governorate", "required", lang)
    ),
    address: Yup.string().required(
      ErrorMessages.generateErrorMessage("Address", "required", lang)
    ),
    lat: Yup.number().required(
      ErrorMessages.generateErrorMessage("Latitude", "required", lang)
    ),
    long: Yup.number().required(
      ErrorMessages.generateErrorMessage("Longitude", "required", lang)
    ),
    working_hours_from: Yup.string().required(
      ErrorMessages.generateErrorMessage("Working hours from", "required", lang)
    ),
    working_hours_to: Yup.string().required(
      ErrorMessages.generateErrorMessage("Working hours to", "required", lang)
    ),
    description: Yup.string().required(
      ErrorMessages.generateErrorMessage("Description", "required", lang)
    ),
  });

  if (isUpdate) {
    return baseSchema.shape({});
  }

  return baseSchema;
};
