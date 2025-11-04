import * as jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { firebaseAuth, firebaseDB } from "../../config/firebase";

export async function register({ email, password, name }: any) {
    try {
        // Create user in Firebase Authentication
        const userRecord = await firebaseAuth.createUser({
            email,
            password,
            displayName: name
        });

        // Store additional user data in Firestore
        await firebaseDB.collection('users').doc(userRecord.uid).set({
            email,
            name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        // Create custom token
        const token = await firebaseAuth.createCustomToken(userRecord.uid);

        return { message: "User registered successfully", token };
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function login({ email, password }: any) {
    try {
        // Get user by email
        const userRecord = await firebaseAuth.getUserByEmail(email);

        // Create custom token
        const token = await firebaseAuth.createCustomToken(userRecord.uid);

        return { token };
    } catch (error) {
        throw new Error('Invalid credentials');
    }
}
