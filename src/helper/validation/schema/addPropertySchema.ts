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

    title_en: Yup.string()
      .required(
        ErrorMessages.generateErrorMessage(
          "العنوان الإنجليزي",
          "required",
          lang
        )
      )
      .min(
        3,
        ErrorMessages.generateErrorMessage("العنوان الإنجليزي", "min", lang)
      ),

    desc_ar: Yup.string()
      .required(
        ErrorMessages.generateErrorMessage("الوصف العربي", "required", lang)
      )
      .min(10, ErrorMessages.generateErrorMessage("الوصف العربي", "min", lang)),

    desc_en: Yup.string()
      .required(
        ErrorMessages.generateErrorMessage("الوصف الإنجليزي", "required", lang)
      )
      .min(
        10,
        ErrorMessages.generateErrorMessage("الوصف الإنجليزي", "min", lang)
      ),

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

    area: Yup.number()
      .required(ErrorMessages.generateErrorMessage("المساحة", "required", lang))
      .positive(ErrorMessages.generateErrorMessage("المساحة", "invalid", lang)),

    attributes: Yup.array()
      .of(
        Yup.object().shape({
          id: Yup.number()
            .required(
              ErrorMessages.generateErrorMessage(
                "Attribute ID",
                "required",
                lang
              )
            )
            .positive(
              ErrorMessages.generateErrorMessage(
                "Attribute ID",
                "invalid",
                lang
              )
            ),
          value: Yup.string().required(
            ErrorMessages.generateErrorMessage(
              "Attribute value",
              "required",
              lang
            )
          ),
          selected_options: Yup.mixed()
            .test(
              "is-valid-options",
              ErrorMessages.generateErrorMessage(
                "Selected options",
                "invalid",
                lang
              ),
              function (value) {
                // الحصول على قيمة id من السمة الحالية
                const { id } = this.parent;

                // إذا لم يكن هناك id، لا داعي للتحقق
                if (!id) return true;

                // في الواقع هنا يجب التحقق من نوع السمة في قاعدة البيانات
                // ولكن لأغراض التحقق نكتفي بالتحقق الأساسي
                if (value && typeof value !== "object") {
                  return false;
                }

                return true;
              }
            )
            .nullable(),
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

    status: Yup.string()
      .required(ErrorMessages.generateErrorMessage("الحالة", "required", lang))
      .oneOf(
        ["new", "used", "under_construction"],
        ErrorMessages.generateErrorMessage("الحالة", "invalid", lang)
      ),

    listing_type: Yup.string()
      .required(
        ErrorMessages.generateErrorMessage("نوع القائمة", "required", lang)
      )
      .oneOf(
        ["sale", "rent"],
        ErrorMessages.generateErrorMessage("نوع القائمة", "invalid", lang)
      ),

  });
