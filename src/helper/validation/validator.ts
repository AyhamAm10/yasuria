import { APIError, HttpStatusCode } from "../../error/api.error";

export const validator = async (schema: any, data: any) => {
  try {
    await schema.validate(data, { abo: false });
  } catch (err) {
    throw new APIError(HttpStatusCode.BAD_REQUEST, err.message);
  }
};
