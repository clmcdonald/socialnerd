import React, { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import { blue, pink } from '@mui/material/colors';
import {
    useLocation
} from "react-router-dom";
import { collection, query, where, addDoc, getFirestore, onSnapshot, serverTimestamp, updateDoc, doc, getDocs } from "firebase/firestore";
import { useHistory } from "react-router-dom";
import Message from '@mui/icons-material/Message';
import moment from 'moment';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

const usernameToImage = {
    Connor: 'guy1.jpg',
    Ricky: 'guy2.jpg',
    Samuel: 'guy3.jpg',
    Andre: 'guy4.jpg',
    Marvin: 'guy5.jpg',
    Sarah: 'woman2.jpg',
    Cindy: 'woman1.jpg',
};

export default function EnrollSuccess() {
    const history = useHistory();

    const [inputValue, setInputValue] = useState('');
    const search = useLocation().search;
    const urlSearchParams = new URLSearchParams(search);
    const enrolled = urlSearchParams.get('enroll');
    const selectedUser = urlSearchParams.get('user');
    const [showEnrollMessage, setShowEnrollMessage] = useState(true);
    const [alertMessage, setAlertMessage] = useState(false);

    const [user, setUser] = useState();
    const [group, setGroup] = useState();
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState({});

    useEffect(() => {
        setTimeout(() => {
            setShowEnrollMessage(false);
        }, 2000);

        const db = getFirestore();
        const usersRef = collection(db, "users");
        const usersQuery = query(usersRef, where('username', '==', selectedUser));

        onSnapshot(usersQuery, (snap) => {
            const users = snap.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));

            if (users.length === 1) {
                setUser(users[0]);
            } else {
                history.push('/');
            }
        });
    }, []);

    useEffect(() => {
        if (user && user.id) {
            const db = getFirestore();
            const groupsRef = collection(db, "groups");
            const groupsQuery = query(groupsRef, where('users', 'array-contains', user.id));

            onSnapshot(groupsQuery, (snap) => {
                const groups = snap.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id,
                }));

                if (groups.length === 1) {
                    setGroup(groups[0]);
                } else {
                    setGroup(null);
                }
            });
        }
    }, [user]);

    useEffect(() => {
        if (group && group.id) {
            const db = getFirestore();
            const messagesRef = collection(db, "messages");
            const messagesQuery = query(messagesRef, where('recipient', '==', group.id));

            onSnapshot(messagesQuery, (snap) => {
                const messagesSnap = snap.docs
                    .map((doc) => ({
                        ...doc.data(),
                        id: doc.id,
                    }))
                    .sort((a, b) => {
                        if (a.date == null) {
                            return 1;
                        } else if (b.date == null) {
                            return -1;
                        } else if (a.date.seconds === b.date.seconds) {
                            return a.date.nanoseconds - b.date.nanoseconds;
                        } else {
                            return a.date.seconds - b.date.seconds;
                        }
                    });

                setMessages(messagesSnap);
            });
        }
    }, [group]);

    useEffect(() => {
        if (group && group.users.length > 0) {
            const db = getFirestore();
            const usersRef = collection(db, "users");
            const userIds = group.users;
            const uniqueUserIds = [...new Set(userIds)];
            const usersQuery = query(usersRef, where('__name__', 'in', uniqueUserIds));

            onSnapshot(usersQuery, (snap) => {
                const users = snap.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id,
                }));

                const usersObj = {};
                users.forEach((u) => {
                    usersObj[u.id] = u;
                });
                setUsers(usersObj);
            });
        }
    }, [messages]);

    useEffect(() => {
        if (alertMessage) {
            setTimeout(() => {
                setAlertMessage(false);
            }, 4000)
        }
    }, [alertMessage]);

    const getAvatarLetter = (username) => {
        if (!username || username.trim().length === 0)
            return null;
        return username.substring(0, 1).toUpperCase();
    };

    const renderAvatar = (avatarLetter, style, senderName, gender) => {
        const image = usernameToImage[senderName];
        if (image) {
            return (
                <Tooltip title={senderName}>
                    <Avatar src={`/${image}`} style={style}>{avatarLetter}</Avatar>
                </Tooltip>
            );
        }
        return (
            <Tooltip title={senderName}>
                <Avatar sx={{ bgcolor: gender === 'female' ? pink[500] : blue[500] }} style={style}>{avatarLetter}</Avatar>
            </Tooltip>
        );
    };

    const renderMessage = (message) => {
        if (users && Object.keys(users).length > 0) {
            const messageSender = users[message.sender];
            if (messageSender != null) {
                const avatarLetter = getAvatarLetter(messageSender.username);
                return (
                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: '10px', marginRight: '10px', paddingBottom: '10px', marginBottom: '10px' }}>
                        {messageSender.id !== user.id && renderAvatar(avatarLetter, { marginRight: '10px' }, messageSender.username, messageSender.gender)}
                        <Alert icon={<Message fontSize="inherit" />} variant="outlined" severity="info" style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <div>{message.content}</div>
                                <div style={{ fontSize: '11px', display: 'flex', alignItems: 'center' }}>
                                    {(message && message.date) ? moment(message.date.toDate()).fromNow() : 'a few seconds ago'}
                                </div>
                            </div>
                        </Alert>
                        {messageSender.id === user.id && renderAvatar(avatarLetter, { marginLeft: '10px' }, messageSender.username, messageSender.gender)}
                    </div>
                );
            }
        }
    };

    const sendMessage = async () => {
        if (inputValue.trim().length > 0) {
            const db = getFirestore();
            await addDoc(collection(db, "messages"), {
                content: inputValue,
                sender: user.id,
                recipient: group.id,
                date: serverTimestamp(),
            });
            setInputValue('');
        } else {
            setAlertMessage(true);
        }
    };

    const renderCard = (userForCard) => {
        const avatarLetter = getAvatarLetter(userForCard.username);
        return (
            <Card sx={{ width: 275, display: 'flex', alignItems: 'center', flexDirection: 'column', marginRight: '5px' }}>
                <CardContent>
                    {renderAvatar(avatarLetter, { marginLeft: 'auto', marginRight: 'auto', width: 70, height: 70 }, userForCard.username, userForCard.gender)}
                    <div style={{ marginTop: '5px', textAlign: 'center' }}>{userForCard.username}</div>
                </CardContent>
                <CardActions>
                    <Button size="small" variant="contained" onClick={async () => {
                        const db = getFirestore();
                        const groupRef = doc(db, "groups", group.id);

                        const updatedObj = {
                            ...group,
                            users: [...group.users.filter((u) => u !== user.id && u !== userForCard.id)],
                        };
                        delete updatedObj.id;

                        await updateDoc(groupRef, updatedObj);
                        await addDoc(collection(db, "groups"), {
                            users: [user.id, userForCard.id],
                            private: true,
                        });
                    }}>Match</Button>
                </CardActions>
            </Card>
        );
    };

    if (group === undefined) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                <CircularProgress />
            </div>
        );
    }

    if (group === null) {
        return (
            <div style={{ textAlign: 'center' }}>
                <h1>You are not in a group</h1>
                <Button variant="contained" onClick={async () => {
                    const db = getFirestore();
                    const groupsRef = collection(db, "groups");
                    const querySnapshot = await getDocs(groupsRef);
                    const groups = querySnapshot.docs.map((doc) => ({
                        ...doc.data(),
                        id: doc.id,
                    }));
                    const pickedGroup = groups.find((g) => {
                        return !g.closed && !g.private;
                    });
                    if (pickedGroup == null) {
                        const db = getFirestore();
                        await addDoc(collection(db, "groups"), {
                            users: [user.id],
                        });
                    } else {
                        const groupRef = doc(db, "groups", pickedGroup.id);

                        const updatedObj = {
                            ...pickedGroup,
                            users: [...pickedGroup.users, user.id],
                        };
                        delete updatedObj.id;
                        await updateDoc(groupRef, updatedObj);
                    }
                }}>Join Group</Button>
            </div>
        );
    }

    if (group.closed === true && user.gender === 'female') {
        const userForCard = users[Object.keys(users)[0]];
        if (userForCard) {
            return (
                <div style={{ display: 'flex', padding: '0 10px', justifyContent: 'space-around' }}>
                    {Object.keys(users).map((userId) => {
                        const u = users[userId];
                        if (u.gender === 'male' && group.users.includes(u.id)) {
                            return renderCard(u);
                        } else {
                            return null;
                        }
                    })}
                </div>
            );
        }
        return null;
    }

    return (
        <div style={{ textAlign: 'center' }}>
            {enrolled && showEnrollMessage && 'Enrolled successfully'}
            {group.private && <div style={{ marginBottom: '10px' }}>Private Room</div>}
            <div style={{ display: 'flex', flexDirection: 'row', marginLeft: '10px', marginBottom: '20px', justifyContent: 'center' }}>
                {Object.keys(users).map((userId) => {
                    const u = users[userId];
                    const avatarLetter = getAvatarLetter(u.username);
                    return renderAvatar(avatarLetter, { marginRight: '10px' }, u.username, u.gender);
                })}
            </div>
            {alertMessage && <Alert style={{ margin: '10px' }} severity="error">Must have at least 1 character typed</Alert>}
            {messages.map(renderMessage)}
            {user.gender === 'female' && <Button variant="contained" color="error" style={{ marginBottom: '10px' }} onClick={async () => {
                const db = getFirestore();
                const groupDoc = doc(db, "groups", group.id);

                const updatedObj = {
                    ...group,
                    closed: true,
                };
                delete updatedObj.id;
                await updateDoc(groupDoc, updatedObj);
            }}>End Chat</Button>}
            {group.closed === true && user.gender === 'male' && <div style={{ marginBottom: '10px' }}>Chat is closed</div>}
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px', marginLeft: '10px', marginBottom: '10px' }}>
                {renderAvatar(getAvatarLetter(selectedUser), { marginRight: '10px' }, user.username, user.gender)}
                <TextField placeholder="Type your message" style={{ flex: 1 }} value={inputValue} onChange={(event) => setInputValue(event.target.value)} onKeyPress={(event) => {
                    if (event.code === 'Enter') {
                        sendMessage();
                    }
                }} />
                <Button style={{ marginLeft: '10px' }} onClick={sendMessage} disabled={group.closed === true}>Send</Button>
            </div>
        </div>
    )
}
