import Context from './Context';
import { useEffect, useState } from 'react';

import cookies from 'js-cookie';
import CryptoJS from 'crypto-js';

import { requestAuth, requestGetCart, requestGetCategory } from '../config/request';

export function Provider({ children }) {
    const [dataUser, setDataUser] = useState({});
    const [dataCart, setDataCart] = useState([]);
    const [dataCategory, setDataCategory] = useState([]);

    const getCart = async () => {
        const res = await requestGetCart();
        setDataCart(res.metadata);
    };

    const getAuthUser = async () => {
        try {
            const res = await requestAuth();
            const bytes = CryptoJS.AES.decrypt(res.metadata.auth, import.meta.env.VITE_SECRET_CRYPTO);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            if (!originalText) {
                console.error('Failed to decrypt data');
                return;
            }
            const user = JSON.parse(originalText);
            setDataUser(user);
        } catch (error) {
            console.error('Auth error:', error);
        }
    };

    const getCategory = async () => {
        const res = await requestGetCategory();
        setDataCategory(res.metadata);
    };

    useEffect(() => {
        const token = cookies.get('logged');
        getCategory();
        const fetchData = async () => {
            try {
                await getAuthUser();
            } catch (error) {
                console.log(error);
            }
        };
        if (token === '1') {
            fetchData();
            getCart();
        }

        return;
    }, []);

    return (
        <Context.Provider value={{ dataUser, dataCart, getCart, dataCategory, getCategory }}>
            {children}
        </Context.Provider>
    );
}
