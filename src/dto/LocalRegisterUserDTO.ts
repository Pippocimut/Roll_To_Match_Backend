import { z } from 'zod'
import { UserModel } from '../database-models/User'

export const LocalRegisterUserZodSchema = z.object({
    username: z.string()
        .min(3, { message: "Username must be at least 3 characters long" })
        .max(256, { message: "Username must be at most 256 characters long" })
        .transform(username => username.toLowerCase().trim()),
    email: z.string()
        .email({ message: "Invalid email address" })
        .min(6, { message: "Email must be at least 6 characters long" })
        .max(256, { message: "Email must be at most 256 characters long" })
        .transform(email => email.toLowerCase().trim()),
    password: z.string()
        .min(6, { message: "Password must be at least 6 characters long" })
        .max(1024, { message: "Password must be at most 1024 characters long" })
}).transform(data => {
    return {
        ...data,
        slug: data.username.toLowerCase().replace(/\s/g, '-')
    };
}).refine(async data => {
    const userExists = await UserModel.findOne({
        $or: [
            { email: data.email },
            { username: data.username },
            { slug: data.slug }
        ]
    });
    if (userExists) {
        return false;

    }
    return true;
}, {
    message: "User with the same email, username, or slug already exists"
})



export type LocalRegisterUserDTO = z.infer<typeof LocalRegisterUserZodSchema>