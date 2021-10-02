import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { useHistory } from "react-router-dom";
import Button from '@mui/material/Button';
import { useLocation } from "react-router-dom";


export default function Header() {
    const history = useHistory();

    const search = useLocation().search;
    const urlSearchParams = new URLSearchParams(search);
    const selectedUser = urlSearchParams.get('user') || null;

    return (
        <AppBar>
            <Toolbar>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Button style={{ color: '#fff' }} onClick={() => history.push('/?user=' + selectedUser)}>SocialNerd</Button>
                    <Button style={{ color: '#fff' }} onClick={() => history.push('/messages?user=' + selectedUser)}>Messages</Button>
                </div>
            </Toolbar>
        </AppBar>
    )
}
