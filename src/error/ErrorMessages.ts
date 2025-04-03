import { lang as globalLang } from "../helper/var";

export class ErrorMessages {

    static generateErrorMessage(entity: string, errorType: string = "not found", lang: string = globalLang): string {
        const messages = {
            en: {
                "not found": `${entity} not found`,
                "unauthorized": `Unauthorized: ${entity} is not authenticated`,
                "forbidden": `Forbidden: You don't have permission to access ${entity}`,
                "bad request": `Bad Request: Invalid data provided for ${entity}`,
                "internal": `Internal Server Error: Something went wrong with ${entity}`,
                "already exists": `${entity} is already taken`,
                //  success
                "created": `${entity} has been successfully created`,
                "retrieved": `${entity} data retrieved successfully`,
                "updated": `${entity} has been successfully updated`,
                "deleted": `${entity} has been successfully deleted`,
                "logged in":"You have successfully logged in.",

                // New keys for min, required, and other validation error messages
                "min": `${entity} should have at least ${lang === 'ar' ? 'عدد' : 'number'} characters`,
                "required": `${entity} is required`,
                "invalid": `${entity} is invalid`

            },
            ar: {
                "not found": `بيانات ${entity} غير موجودة `,
                "unauthorized": `غير مصرح: ${entity} غير مصدق`,
                "forbidden": `ممنوع: ليس لديك صلاحية للوصول إلى ${entity}`,
                "bad request": `طلب غير صالح: البيانات المدخلة لـ ${entity} غير صحيحة`,
                "internal": `خطأ داخلي في الخادم: حدث خطأ أثناء معالجة ${entity}`,
                "already exists": `${entity} مُستخدم بالفعل`,
                //  success
                "created": `تم إنشاء ${entity} بنجاح`,
                "retrieved": `تم جلب بيانات ${entity} بنجاح`,
                "updated": `تم تحديث ${entity} بنجاح`,
                "deleted": `تم حذف ${entity} بنجاح`,
                "logged in":"تم تسجيل الدخول بنجاح",

                // New keys for min, required, and other validation error messages
                "min": `يجب أن يحتوي ${entity} على الأقل على ${lang === 'ar' ? 'عدد' : 'number'} من الأحرف`,
                "required": `الحقل ${entity} مطلوب`,
                "invalid": `القيمة المدخلة لـ ${entity} غير صحيحة`

            }
        };

        return messages[lang]?.[errorType] || messages[lang]?.["internal"] || `${entity} error occurred`;
    }
}
