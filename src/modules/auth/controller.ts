import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../../config/db";
import { env } from "../../config/env";

export async function register({ email, password, name }: any) {
    const hash = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)", [email, hash, name]);
    return { message: "User registered" };
}

export async function login({ email, password }: any) {
    const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    const user = (rows as any[])[0];
    if (!user) throw { status: 400, message: "Email not found" };

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw { status: 401, message: "Wrong password" };

    const token = jwt.sign({ id: user.id, email: user.email }, env.jwtSecret, { expiresIn: env.jwtExpires });
    return { token, user };
}
