import React from 'react';
import Button from '@mui/material/Button';
import { doc, deleteDoc, collection, getDocs, getFirestore, addDoc } from "firebase/firestore";
import { useHistory } from "react-router-dom";

export default function AdminPage() {
    const history = useHistory();

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
                <Button variant="contained" style={{ marginBottom: '20px' }} onClick={async () => {
                    clearCollection('messages');
                    history.push('/messages?user=connor')
                }}>Clear all messages</Button>
            </div>

            <div>
                <Button variant="contained" style={{ marginBottom: '20px' }} onClick={async () => {
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
                }}>Reset data for demo</Button>
            </div>
        </div>
    )
}
