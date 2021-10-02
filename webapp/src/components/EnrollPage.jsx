import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useHistory } from "react-router-dom";
import { getFirestore, onSnapshot, collection, addDoc } from "firebase/firestore";

const EnrollPage = ({ }) => {
    const history = useHistory();
    const [username, setUsername] = useState('');
    const [interests, setInterests] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [loginField, setLoginField] = useState('');
    const [gender, setGender] = useState('female');

    useEffect(() => {
        const db = getFirestore();
        const interestsRef = collection(db, "interests");
        onSnapshot(interestsRef, (snap) => {
            const interestsSnap = snap.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            setInterests(interestsSnap);
        });
    }, []);

    return (
        <div style={{ textAlign: 'center' }}>
            <FormControl style={{ width: '200px' }}>
                <TextField variant="standard" label="Username" value={username} onChange={(event) => setUsername(event.target.value)} />
                <Autocomplete
                    multiple
                    id="interests"
                    options={interests}
                    getOptionLabel={(option) => option.title}
                    defaultValue={[interests[0]]}
                    onChange={(event) => {

                    }}
                    inputValue={inputValue}
                    onInputChange={(event) => {
                        if (event && event.target)
                            setInputValue(event.target.value)
                    }}
                    getOptionLabel={(option) => option.name}
                    onKeyPress={async (event) => {
                        if (event.code === 'Enter') {
                            if (inputValue.trim().length > 0) {
                                const db = getFirestore();
                                await addDoc(collection(db, "interests"), {
                                    name: inputValue,
                                });
                                setInputValue('');
                            };
                        }
                    }}
                    onChange={(event, newValue) => {
                        setSelectedInterests(newValue);
                    }}
                    value={selectedInterests}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="standard"
                            label="Interests"
                            placeholder="Type your interests"
                        />
                    )}
                />
                <RadioGroup
                    aria-label="gender"
                    name="radio-buttons-group"
                    value={gender}
                    onChange={(event) => setGender(event.target.value)}
                >
                    <FormControlLabel value="female" control={<Radio />} label="Female" />
                    <FormControlLabel value="male" control={<Radio />} label="Male" />
                </RadioGroup>
            </FormControl>
            <div style={{ marginTop: '50px' }}>
                <Button onClick={async () => {
                    const db = getFirestore();
                    await addDoc(collection(db, "users"), {
                        username: username,
                        gender: gender,
                        interests: selectedInterests.map((selected) => selected.id),
                    });
                    history.push('/messages?enroll=true&user=' + username);
                }} disabled={selectedInterests.length < 1} variant="contained" style={{ marginBottom: '50px' }}>Enroll</Button>
            </div>
            <div style={{ marginTop: '20px', borderBottom: '1px solid #ccc' }} />
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column' }}>
                <div>
                    <TextField placeholder="Existing user" value={loginField} onChange={(event) => setLoginField(event.target.value)} />
                </div>
                <div style={{ marginTop: '10px' }}>
                    <Button onClick={() => {
                        history.push('/messages?user=' + loginField);
                    }} variant="contained">Login</Button>
                </div>
            </div>
        </div>
    );
};

export default EnrollPage;
