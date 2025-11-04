import { Request, Response } from "express";
import { firebaseAuth, firebaseDB } from "../../config/firebase";

export async function testFirebaseConnection(req: Request, res: Response) {
    try {
        // Test Firestore connection by writing and reading a test document
        const testRef = firebaseDB.collection('test').doc('connection-test');
        const timestamp = new Date().toISOString();

        // Write test data
        await testRef.set({
            timestamp,
            message: 'Firebase connection test'
        });

        // Read test data
        const doc = await testRef.get();

        // Test Firebase Auth by listing users (requires auth setup)
        await firebaseAuth.listUsers(1);

        // Optionally list top-level Firestore collections to validate access
        const collections = await firebaseDB.listCollections();
        const collectionIds = collections.map(c => c.id);

        res.json({
            success: true,
            message: 'Firebase connection successful',
            firestoreTest: {
                written: timestamp,
                read: doc.data(),
                collections: collectionIds
            },
            authTest: 'Firebase Auth connection successful'
        });

        // Clean up test document
        await testRef.delete();

    } catch (error: any) {
        console.error('Firebase connection test failed:', error);
        // Provide richer error details to aid debugging (but avoid leaking secrets)
        res.status(500).json({
            success: false,
            message: 'Firebase connection failed',
            error: {
                message: error.message,
                code: error.code || null,
                details: error.details || null
            }
        });
    }
}