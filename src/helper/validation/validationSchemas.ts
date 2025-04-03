import * as Yup from "yup";
import { ErrorMessages } from "../../error/ErrorMessages";

export const getLoginSchema = Yup.object({
  phone: Yup.string()
    .required(ErrorMessages.generateErrorMessage("Phone", "not found" ))
    .matches(/^09\d{8}$/, ErrorMessages.generateErrorMessage("Phone", "bad request")),

  password: Yup.string()
    .required(ErrorMessages.generateErrorMessage("Password", "not found"))
    .min(8, ErrorMessages.generateErrorMessage("Password", "bad request")),
});

export const getRegisterSchema = Yup.object({
  name: Yup.string()
    .required(ErrorMessages.generateErrorMessage("Name", "not found"))
    .min(3, ErrorMessages.generateErrorMessage("Name", "bad request")),

  phone: Yup.string()
    .required(ErrorMessages.generateErrorMessage("Phone", "not found"))
    .matches(/^09\d{8}$/, ErrorMessages.generateErrorMessage("Phone", "bad request")),

  password: Yup.string()
    .required(ErrorMessages.generateErrorMessage("Password", "not found"))
    .min(8, ErrorMessages.generateErrorMessage("Password", "bad request")),

  role: Yup.string()
    .required(ErrorMessages.generateErrorMessage("Role", "not found"))
    .oneOf(["user", "vendor"], ErrorMessages.generateErrorMessage("Role", "bad request")),
});

export const addCarSchema = Yup.object({
  title: Yup.string()
    .required(ErrorMessages.generateErrorMessage("Title", "not found"))
    .min(3, ErrorMessages.generateErrorMessage("Title", "bad request")),

  model: Yup.string().required(ErrorMessages.generateErrorMessage("Model", "not found")),
  brand: Yup.string().required(ErrorMessages.generateErrorMessage("Brand", "not found")),
  location: Yup.string().required(ErrorMessages.generateErrorMessage("Location", "not found")),
  isActive: Yup.boolean(),
  price: Yup.number()
    .required(ErrorMessages.generateErrorMessage("Price", "not found"))
    .positive(ErrorMessages.generateErrorMessage("Price", "bad request")),
});

export const addPropertySchema = Yup.object({
  title: Yup.string()
    .required(ErrorMessages.generateErrorMessage("Title", "not found"))
    .min(3, ErrorMessages.generateErrorMessage("Title", "bad request")),

  isActive: Yup.boolean(),
  description: Yup.string()
    .required(ErrorMessages.generateErrorMessage("Description", "not found"))
    .min(10, ErrorMessages.generateErrorMessage("Description", "bad request")),

  location: Yup.string().required(ErrorMessages.generateErrorMessage("Location", "not found")),

  status: Yup.string()
    .required(ErrorMessages.generateErrorMessage("Status", "not found"))
    .oneOf(["new", "used"], ErrorMessages.generateErrorMessage("Status", "bad request")),

  price: Yup.number()
    .required(ErrorMessages.generateErrorMessage("Price", "not found"))
    .positive(ErrorMessages.generateErrorMessage("Price", "bad request")),

  area: Yup.number()
    .required(ErrorMessages.generateErrorMessage("Area", "not found"))
    .positive(ErrorMessages.generateErrorMessage("Area", "bad request")),

  specifications: Yup.mixed()
    .required(ErrorMessages.generateErrorMessage("Specifications", "not found"))
    .test("is-valid-object", ErrorMessages.generateErrorMessage("Specifications", "bad request"), (value) => {
      if (typeof value === "string") {
        try {
          JSON.parse(value);
          return true;
        } catch (error) {
          return false;
        }
      }
      return typeof value === "object" && value !== null;
    }),
});
