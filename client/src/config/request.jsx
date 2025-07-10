import axios from 'axios';
import cookies from 'js-cookie';

const request = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
});

export const requestChatbot = async (data) => {
    const res = await request.post('/api/chat', data);
    return res.data;
};

export const requestResetPassword = async (data) => {
    const res = await request.post('/api/reset-password', data);
    return res.data;
};

export const requestForgotPassword = async (data) => {
    const res = await request.post('/api/forgot-password', data);
    return res.data;
};

export const requestCancelOrder = async (data) => {
    const res = await request.post('/api/cancel-order', data);
    return res.data;
};

export const requestUpdateQuantity = async (data) => {
    const res = await request.post('/api/update-quantity', data);
    return res.data;
};

export const requestUpdatePayment = async (data) => {
    const res = await request.put('/api/update-payment', data);
    return res.data;
};

export const requestTotalWebsite = async () => {
    const res = await request.get('/api/total-website');
    return res.data;
};

export const requestGetPaymentsAdmin2 = async () => {
    const res = await request.get('/api/payments-admin2');
    return res.data;
};

export const requestGetPaymentsAdmin = async () => {
    const res = await request.get('/api/payments-admin');
    return res.data;
};

export const requestGetStatisticProduct = async () => {
    const res = await request.get('/api/product-sell');
    return res.data;
};

export const requestGetRevenue = async () => {
    const res = await request.get('/api/revenue');
    return res.data;
};

export const requestAdmin = async () => {
    const res = await request.get('/api/admin');
    return res.data;
};

export const requestSearchProduct = async (nameProduct) => {
    const res = await request.get(`/api/search-product`, {
        params: {
            nameProduct,
        },
    });
    return res.data;
};

export const requestDeleteProduct = async (data) => {
    const res = await request.post('/api/delete-product', data);
    return res.data;
};

export const requestCreateProduct = async (data) => {
    const res = await request.post('/api/add-product', data);
    return res.data;
};

export const requestUpdateProduct = async (data) => {
    const res = await request.post('/api/update-product', data);
    return res.data;
};

export const requestLogin = async (data) => {
    const res = await request.post('/api/login', data);
    return res.data;
};

export const requestRegister = async (data) => {
    const res = await request.post('/api/register', data);
    return res.data;
};

export const requestLogout = async () => {
    const res = await request.get('/api/logout');
    return res.data;
};

export const requestRefreshToken = async () => {
    const res = await request.get('/api/refresh-token');
    return res.data;
};

export const requestAuth = async () => {
    const res = await request.get('/api/auth');
    return res.data;
};

export const requestUpdateIsActive = async (data) => {
    const res = await request.post('/api/update-is-active', data);
    return res.data;
};

export const requestGetAllUser = async () => {
    const res = await request.get('/api/users');
    return res.data;
};

export const requestUpdateUser = async (data) => {
    const res = await request.post('/api/update-user', data);
    return res.data;
};

/// products
export const requestAddProduct = async (data) => {
    const res = await request.post('/api/add-product', data);
    return res.data;
};

export const requestGetAllProduct = async () => {
    const res = await request.get('/api/get-all-product');
    return res.data;
};

export const requestGetProductById = async (id) => {
    const res = await request.get(`/api/get-product-by-id`, {
        params: {
            id,
        },
    });
    return res.data;
};

export const requestGetAllProductAdmin = async () => {
    const res = await request.get('/api/get-all-product-admin');
    return res.data;
};

/// category
export const requestAddCategory = async (data) => {
    const res = await request.post('/api/add-category', data);
    return res.data;
};

/// cart
export const requestAddCart = async (data) => {
    const res = await request.post('/api/add-cart', data);
    return res.data;
};

export const requestGetCart = async () => {
    const res = await request.get('/api/get-cart');
    return res.data;
};

export const requestDeleteCart = async (data) => {
    const res = await request.delete('/api/delete-cart', { data });
    return res.data;
};

export const requestUpdateInfoCart = async (data) => {
    const res = await request.post('/api/update-cart', data);
    return res.data;
};

export const requestCreatePayments = async (data) => {
    const res = await request.post('/api/create-payments', data);
    return res.data;
};

export const requestApplyCoupon = async (data) => {
    const res = await request.post('/api/apply-coupon', data);
    return res.data;
};

/// coupon
export const requestGetAllCoupon = async () => {
    const res = await request.get('/api/coupons');
    return res.data;
};

export const requestCreateCoupon = async (data) => {
    const res = await request.post('/api/create-coupon', data);
    return res.data;
};

export const requestUpdateCoupon = async (data) => {
    const res = await request.post('/api/update-coupon', data);
    return res.data;
};

export const requestDeleteCoupon = async (id) => {
    const res = await request.delete('/api/delete-coupon', {
        params: {
            id,
        },
    });
    return res.data;
};

/// category
export const requestGetCategory = async () => {
    const res = await request.get('/api/get-category');
    return res.data;
};

export const requestGetProductByCategory = async (id) => {
    const res = await request.get(`/api/get-product-by-category`, {
        params: {
            id,
        },
    });
    return res.data;
};

export const requestDeleteCategory = async (data) => {
    const res = await request.post(`/api/delete-category`, data);
    return res.data;
};
export const requestUpdateCategory = async (data) => {
    const res = await request.post('/api/update-category', data);
    return res.data;
};

/// payments
export const requestGetPayment = async (id) => {
    const res = await request.get(`/api/get-payment`, {
        params: {
            id,
        },
    });
    return res.data;
};

export const requestGetPaymentsUser = async () => {
    const res = await request.get('/api/get-payments-user');
    return res.data;
};

let isRefreshing = false;
let failedRequestsQueue = [];

request.interceptors.response.use(
    (response) => response, // Trả về nếu không có lỗi
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 (Unauthorized) và request chưa từng thử refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    // Gửi yêu cầu refresh token
                    const token = cookies.get('logged');
                    if (!token) {
                        return;
                    }
                    await requestRefreshToken();

                    // Xử lý lại tất cả các request bị lỗi 401 trước đó
                    failedRequestsQueue.forEach((req) => req.resolve());
                    failedRequestsQueue = [];
                } catch (refreshError) {
                    // Nếu refresh thất bại, đăng xuất
                    failedRequestsQueue.forEach((req) => req.reject(refreshError));
                    failedRequestsQueue = [];
                    localStorage.clear();
                    window.location.href = '/login'; // Chuyển về trang đăng nhập
                } finally {
                    isRefreshing = false;
                }
            }

            // Trả về một Promise để retry request sau khi token mới được cập nhật
            return new Promise((resolve, reject) => {
                failedRequestsQueue.push({
                    resolve: () => {
                        resolve(request(originalRequest));
                    },
                    reject: (err) => reject(err),
                });
            });
        }

        return Promise.reject(error);
    },
);
