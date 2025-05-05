import * as Yup from "yup";
import { ErrorMessages } from "../../../error/ErrorMessages";
import { EntityAttribute } from "../../../entity/Attribute";

export const addCarSchema = (lang: string) =>
  Yup.object().shape({
    title_ar: Yup.string()
      .required(
        ErrorMessages.generateErrorMessage("العنوان العربي", "required", lang)
      )
      .min(
        3,
        ErrorMessages.generateErrorMessage("العنوان العربي", "min", lang)
      ),

    // title_en: Yup.string()
    //   .required(ErrorMessages.generateErrorMessage("العنوان الإنجليزي", "required", lang))
    //   .min(3, ErrorMessages.generateErrorMessage("العنوان الإنجليزي", "min", lang)),

    desc_ar: Yup.string()
      .required(
        ErrorMessages.generateErrorMessage("الوصف العربي", "required", lang)
      )
      .min(10, ErrorMessages.generateErrorMessage("الوصف العربي", "min", lang)),

    // desc_en: Yup.string()
    //   .required(ErrorMessages.generateErrorMessage("الوصف الإنجليزي", "required", lang))
    //   .min(10, ErrorMessages.generateErrorMessage("الوصف الإنجليزي", "min", lang)),

    // model: Yup.string()
    //   .required(ErrorMessages.generateErrorMessage("الموديل", "required", lang)),

    // brand: Yup.string()
    //   .required(ErrorMessages.generateErrorMessage("الماركة", "required", lang)),

    location: Yup.string().required(
      ErrorMessages.generateErrorMessage("الموقع", "required", lang)
    ),

    lat: Yup.number()
      .nullable()
      .typeError(
        ErrorMessages.generateErrorMessage("خط العرض", "invalid", lang)
      )
      .when("long", (long, schema) =>
        long ? schema.required() : schema.notRequired()
      ),

    long: Yup.number()
      .nullable()
      .typeError(
        ErrorMessages.generateErrorMessage("خط الطول", "invalid", lang)
      )
      .when("lat", (lat, schema) =>
        lat ? schema.required() : schema.notRequired()
      ),

    price: Yup.number()
      .required(ErrorMessages.generateErrorMessage("السعر", "required", lang))
      .positive(ErrorMessages.generateErrorMessage("السعر", "invalid", lang)),

    attributes: Yup.array()
      .of(
        Yup.object().shape({
          id: Yup.number().required(),
          value: Yup.string().required(),
        })
      )
      .nullable(),
      
    specifications: Yup.array()
      .of(
        Yup.object().shape({
          id: Yup.number().required(),
          value: Yup.string().required(),
        })
      )
      .nullable(),

    // status: Yup.string()
    //   .required(ErrorMessages.generateErrorMessage("الحالة", "required", lang))
    //   .oneOf(
    //     ["new", "used"],
    //     ErrorMessages.generateErrorMessage("الحالة", "invalid", lang)
    //   ),

    listing_type: Yup.string()
      .required(
        ErrorMessages.generateErrorMessage("نوع القائمة", "required", lang)
      )
      .oneOf(
        ["sale", "rent"],
        ErrorMessages.generateErrorMessage("نوع القائمة", "invalid", lang)
      ),
  });
