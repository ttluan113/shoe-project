import App from '../App';
import LoginUser from '../Pages/LoginUser/LoginUser';
import RegisterUser from '../Pages/Register/Register';
import DetailProducts from '../Pages/DetailProducts/DetailProducts';
import CartUser from '../Pages/Cart/CartUser';
import Payments from '../Pages/Payments/Payments';
import PaymentSuccess from '../Pages/PaymentsSucces/PaymentsSucces';
import InfoUser from '../Pages/InfoUser/InfoUser';
import Category from '../Pages/Category/Category';
import SearchProduct from '../Pages/SearchProduct/SearchProduct';
import DashBroad from '../Pages/DashBroad/DashBroad';
import ForgotPassword from '../Pages/ForgotPassword/ForgotPassword';
export const publicRoutes = [
    { path: '/', component: <App /> },
    { path: '/login', component: <LoginUser /> },
    { path: '/register', component: <RegisterUser /> },
    { path: '/product/:id', component: <DetailProducts /> },
    { path: '/cart', component: <CartUser /> },
    { path: '/payments', component: <Payments /> },
    { path: '/paymentsuccess/:id', component: <PaymentSuccess /> },
    { path: '/profile', component: <InfoUser /> },
    { path: '/category/:id', component: <Category /> },
    { path: '/orders', component: <InfoUser /> },
    { path: '/searchproduct/:nameProduct', component: <SearchProduct /> },
    { path: '/admin', component: <DashBroad /> },
    { path: '/forgotPassword', component: <ForgotPassword /> },
];
