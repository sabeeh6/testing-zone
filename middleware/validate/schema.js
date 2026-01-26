import {z} from "zod";



export const signUpValidationSchema = z.object({
    body:z.object({
        name:z.string({required_error:"Name is required"}).min(2 , "Name must be consist of 2 characters"),
        email:z.string({required_error:"Email is required"}).email("Email is not valid.").trim().toLowerCase(),
        password:z.string({required_error:"Password is required"}).min(8 , "Password must be at least 8 characters").
        regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
            "Password must contain at least one uppercase, one lowercase, one special character, and one number"
        ),
    })
})

export const signInValidationSchema = z.object({
    body:z.object({
        email:z.string({required_error:"Email is required"}).email("Email is not valid.").trim().toLowerCase(),
        password:z.string({required_error:"Password is required"}).min(8 , "Password must be at least 8 characters")
    })
})
