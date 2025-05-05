import * as Yup from "yup";
import { ErrorMessages } from "../../../error/ErrorMessages";
import { EntityAttribute } from "../../../entity/Attribute";

export const addPropertySchema = (lang: string) =>
  Yup.object().shape({
    title_ar: Yup.string()
      .required(
        ErrorMessages.generateErrorMessage("العنوان العربي", "required", lang)
      )
      .min(
        3,
        ErrorMessages.generateErrorMessage("العنوان العربي", "min", lang)
      ),


    desc_ar: Yup.string()
      .required(
        ErrorMessages.generateErrorMessage("الوصف العربي", "required", lang)
      )
      .min(10, ErrorMessages.generateErrorMessage("الوصف العربي", "min", lang)),

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

    attributes:Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.number().required(),
        value: Yup.string().required()
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


    listing_type: Yup.string()
      .required(
        ErrorMessages.generateErrorMessage("نوع القائمة", "required", lang)
      )
      .oneOf(
        ["sale", "rent"],
        ErrorMessages.generateErrorMessage("نوع القائمة", "invalid", lang)
      ),

  });
