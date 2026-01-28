// SnackbarContext.js
import React, { createContext, useState, useContext } from 'react';
import { Snackbar, SnackbarContent } from '@mui/material';

const SnackbarContext = createContext();

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');

    const showSnackbar = (msg) => {
        setMessage(msg);
        setOpen(true);
    };

    const closeSnackbar = () => {
        setOpen(false);
    };

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={closeSnackbar}
            >
                <SnackbarContent
                    message={message}
                    style={{
                        backgroundColor: 'green',
                        color: 'white',
                    }}
                />
            </Snackbar>
        </SnackbarContext.Provider>
    );
};
