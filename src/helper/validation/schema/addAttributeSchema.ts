import * as Yup from "yup";
import { ErrorMessages } from "../../../error/ErrorMessages";
import { EntityAttribute } from "../../../entity/Attribute";

export const attributeSchema = (lang: string) =>
  Yup.object({
    title: Yup.string()
      .required(ErrorMessages.generateErrorMessage("Title", "required", lang))
      .min(3, ErrorMessages.generateErrorMessage("Title", "min", lang)),

    type: Yup.string()
      .required(ErrorMessages.generateErrorMessage("Type", "required", lang)),

    entity: Yup.string()
      .required(ErrorMessages.generateErrorMessage("Entity", "required", lang))
      .oneOf(
        [EntityAttribute.car , EntityAttribute.properties],
        ErrorMessages.generateErrorMessage("Entity", "invalid", lang)
      ),
  });
