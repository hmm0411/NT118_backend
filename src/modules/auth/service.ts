import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { env } from "../../config/env";

export async function register({ email, password }: any) {
    const hash = await bcrypt.hash(password, 10);
    // TODO: insert DB
    return { message: "User registered", hash };
}

export async function login({ email, password }: any) {
    // TODO: fetch user from DB
    const token = jwt.sign({ email }, env.jwtSecret, { expiresIn: env.jwtExpires });
    return { token };
}
