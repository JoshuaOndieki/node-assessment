import joi from 'joi'


export const signupSchema = joi.object({
name:joi.string().required().min(3),
email:joi.string().email().required(),
password:joi.string().pattern(new  RegExp(`^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$`))
})