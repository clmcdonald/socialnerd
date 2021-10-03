import React, { useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import { doc, deleteDoc, collection, getDocs, getFirestore, addDoc } from "firebase/firestore";

export default function AdminPage() {
    const [resettingData, setResettingData] = useState(false);
    const [clearingMessages, setClearingMessages] = useState(false);

    const clearCollection = async (collectionName) => {
        const db = getFirestore();
        const collectionRef = collection(db, collectionName);
        const querySnapshot = await getDocs(collectionRef);
        const docIds = querySnapshot.docs.map((doc) => doc.id);
        docIds.forEach(async (docId) => await deleteDoc(doc(db, collectionName, docId)));
    };

    const addDocument = async (collectionName, doc) => {
        const db = getFirestore();
        const firestoreDoc = await addDoc(collection(db, collectionName), doc);
        return firestoreDoc.id;
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <div>
                <LoadingButton loading={clearingMessages} variant="contained" style={{ marginBottom: '20px' }} onClick={async () => {
                    setClearingMessages(true);
                    await clearCollection('messages');
                    setClearingMessages(false);
                }}>Clear all messages</LoadingButton>
            </div>

            <div>
                <LoadingButton loading={resettingData} variant="contained" style={{ marginBottom: '20px' }} onClick={async () => {
                    setResettingData(true);
                    await clearCollection('messages');
                    console.log('Cleared messages');
                    await clearCollection('users');
                    console.log('Cleared users');
                    await clearCollection('groups');
                    console.log('Cleared groups');
                    await clearCollection('interests');
                    console.log('Cleared interests');

                    const sportsId = await addDocument('interests', {
                        name: 'Sports',
                    });
                    await addDocument('interests', {
                        name: 'Culture',
                    });
                    await addDocument('interests', {
                        name: 'Music',
                    });
                    console.log('Added interests');

                    const connorId = await addDocument('users', {
                        gender: 'male',
                        username: 'Connor',
                        interests: [sportsId],
                    });
                    const rickyId = await addDocument('users', {
                        gender: 'male',
                        username: 'Ricky',
                        interests: [sportsId],
                    });
                    const samuelId = await addDocument('users', {
                        gender: 'male',
                        username: 'Samuel',
                        interests: [sportsId],
                    });
                    const andreId = await addDocument('users', {
                        gender: 'male',
                        username: 'Andre',
                        interests: [sportsId],
                    });
                    const marvinId = await addDocument('users', {
                        gender: 'male',
                        username: 'Marvin',
                        interests: [sportsId],
                    });
                    console.log('Added users');

                    await addDocument('groups', {
                        users: [connorId, rickyId, samuelId, andreId, marvinId],
                    });
                    console.log('Added group');
                    setResettingData(false);
                }}>Reset data for demo</LoadingButton>
            </div>
        </div>
    )
}
