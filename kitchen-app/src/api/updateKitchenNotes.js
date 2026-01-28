// src/api/updateKitchenNotes.js
import axios from 'axios';

const updateKitchenNotes = async (data) => {
    try {
        const baseURL = window.location.hostname === 'localhost'
            ? 'http://localhost'
            : `http://${window.location.hostname}`;

        const response = await axios.post(`${baseURL}/api/updateKitchenNotes`, data, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error('Error updating kitchen notes:', error);
        return { error: error.response ? error.response.data : 'Unknown error occurred' };
    }
};

export default updateKitchenNotes;
