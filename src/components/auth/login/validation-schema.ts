import { PASSWORD_REGEX } from "constants/regex";
import z from "zod";

export const loginValidationSchema = (t: (key: string) => string) => (
    z.object({
        username: z.string({ required_error: t('errors.username_required') }),
        password: z.string({ required_error: t('errors.password_required') })
            .regex(PASSWORD_REGEX, t('errors.invalid_password')),
    })
)