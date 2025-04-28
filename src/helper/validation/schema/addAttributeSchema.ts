import * as Yup from "yup";
import { ErrorMessages } from "../../../error/ErrorMessages";
import { EntityAttribute } from "../../../entity/Attribute";

export const attributeSchema = (lang: string) =>
  Yup.object().shape({
    title: Yup.string()
      .required(ErrorMessages.generateErrorMessage("Title", "required", lang))
      .min(3, ErrorMessages.generateErrorMessage("Title", "min", lang)),

    input_type: Yup.string()
      .required(ErrorMessages.generateErrorMessage("Input type", "required", lang))
      .oneOf(
        ["text", "dropdown", "nested_dropdown"],
        ErrorMessages.generateErrorMessage("Input type", "invalid", lang)
      ),

    entity: Yup.string()
      .required(ErrorMessages.generateErrorMessage("Entity", "required", lang))
      .oneOf(
        Object.values(EntityAttribute),
        ErrorMessages.generateErrorMessage("Entity", "invalid", lang)
      ),

    parent_id: Yup.number()
      .nullable()
      .optional(),

    parent_value: Yup.string()
      .nullable()
      .optional()
      .when('parent_id', {
        is: (value: number) => !!value,
        then: (schema) => schema.required(
          ErrorMessages.generateErrorMessage("Parent value", "required", lang)
        )
      }),

    options: Yup.array()
      .nullable()
      .optional()
      .when('input_type', {
        is: (value: string) => ['dropdown', 'nested_dropdown'].includes(value),
        then: (schema) => schema
          .of(
            Yup.object().shape({
              value: Yup.string().required(),
              label: Yup.string().required()
            })
          )
          .min(1, ErrorMessages.generateErrorMessage("Options", "min", lang))
      }),

  });