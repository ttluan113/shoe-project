import classNames from 'classnames/bind';
import styles from './Payments.module.scss';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import axios from 'axios';
import { requestApplyCoupon, requestCreatePayments, requestUpdateInfoCart } from '../../config/request';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { message } from 'antd';

const cx = classNames.bind(styles);

function Payments() {
    const [tinhthanh, setTinhThanh] = useState([]);
    const [idTinhThanh, setIdTinhThanh] = useState(0);
    const [huyen, setHuyen] = useState([]);
    const [idHuyen, setIdHuyen] = useState(0);
    const [xa, setXa] = useState([]);
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const [nameCoupon, setNameCoupon] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = {
                    name,
                    phone,
                    address,
                };
                const res = await requestUpdateInfoCart(data);
                console.log(res);
            } catch (error) {
                console.log(error);
            }
        };
        if (name.length > 0 && phone.length > 0 && address.length > 0) {
            fetchData();
        }
    }, [name, phone, address]);

    const navigate = useNavigate();

    const { dataCart, getCart } = useStore();

    useEffect(() => {
        if (dataCart[0]?.nameCoupon) {
            setNameCoupon(dataCart[0]?.nameCoupon);
        }
    }, [dataCart]);

    useEffect(() => {
        axios.get('https://esgoo.net/api-tinhthanh/1/0.htm').then((res) => setTinhThanh(res.data.data));
    }, []);

    useEffect(() => {
        if (idTinhThanh !== 0) {
            axios.get(`https://esgoo.net/api-tinhthanh/2/${idTinhThanh}.htm`).then((res) => setHuyen(res.data.data));
        }
    }, [idTinhThanh]);

    useEffect(() => {
        if (idHuyen !== 0) {
            axios.get(`https://esgoo.net/api-tinhthanh/3/${idHuyen}.htm`).then((res) => setXa(res.data.data));
        }
    }, [idHuyen]);

    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handlePayment = async () => {
        try {
            const data = {
                typePayment: paymentMethod,
            };
            if (paymentMethod === 'COD') {
                const res = await requestCreatePayments(data);
                navigate(`/paymentsuccess/${res.metadata._id}`);
            }
            if (paymentMethod === 'VNPAY') {
                const res = await requestCreatePayments(data);
                window.open(res.metadata);
            }
            if (paymentMethod === 'Momo') {
                const res = await requestCreatePayments(data);
                window.open(res.payUrl);
            }
        } catch (error) {
            message.error(error.response.data.message);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleApplyCoupon = async () => {
        const data = {
            nameCoupon,
        };
        try {
            const res = await requestApplyCoupon(data);
            message.success(res.message);
            getCart();
        } catch (error) {
            message.error(error.response.data.message);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <main className={cx('main')}>
                <h2>Thanh toán</h2>
                <div className={cx('form-payments')}>
                    <div className={cx('column-left')}>
                        <h3>THÔNG TIN THANH TOÁN</h3>
                        <div className={cx('form-1')}>
                            <div className="form-floating mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="floatingInput"
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <label htmlFor="floatingInput">Họ và tên *</label>
                            </div>
                            <div className="form-floating">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="floatingPassword"
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                                <label htmlFor="floatingPassword">Số điện thoại *</label>
                            </div>
                        </div>

                        <div>
                            <div className="form-floating mb-3">
                                <input type="text" className="form-control" id="floatingInput" />
                                <label htmlFor="floatingInput">Địa chỉ email *</label>
                            </div>
                            <select
                                className="form-select"
                                aria-label="Default select example"
                                selected
                                onChange={(e) => setIdTinhThanh(e.target.value)}
                            >
                                <option value="0">Tỉnh/Thành</option>
                                {tinhthanh.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                onChange={(e) => setIdHuyen(e.target.value)}
                                className="form-select mt-3"
                                aria-label="Default select example"
                            >
                                <option value="0">Quận/Huyện</option>
                                {huyen.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>

                            <select className="form-select mt-3" aria-label="Default select example">
                                <option value="0">Xã/Phường/Thị trấn</option>
                                {xa.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="form-floating mt-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="floatingInput"
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                                <label htmlFor="floatingInput">Địa Chỉ *</label>
                            </div>
                        </div>

                        <div className="form-floating mt-3">
                            <textarea
                                style={{ height: '100px' }}
                                className="form-control"
                                placeholder="Leave a comment here"
                                id="floatingTextarea"
                            ></textarea>
                            <label htmlFor="floatingTextarea">Ghi Chú Đơn Hàng</label>
                        </div>

                        <div className={cx('select-payment')}>
                            <h4>PHƯƠNG THỨC THANH TOÁN</h4>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="paymentMethod"
                                    value="COD"
                                    id="flexRadioDefault1"
                                    onChange={handlePaymentMethodChange}
                                    checked={paymentMethod === 'COD'}
                                />
                                <label className="form-check-label" htmlFor="flexRadioDefault1">
                                    Thanh Toán Khi Nhận Hàng
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="paymentMethod"
                                    value="Momo"
                                    id="flexRadioDefault2"
                                    onChange={handlePaymentMethodChange}
                                    checked={paymentMethod === 'Momo'}
                                />
                                <label className="form-check-label" htmlFor="flexRadioDefault2">
                                    Thanh Toán Qua Momo
                                </label>
                            </div>

                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="paymentMethod"
                                    value="VNPAY"
                                    id="flexRadioDefault2"
                                    onChange={handlePaymentMethodChange}
                                    checked={paymentMethod === 'VNPAY'}
                                />
                                <label className="form-check-label" htmlFor="flexRadioDefault2">
                                    Thanh Toán Qua VNPAY
                                </label>
                            </div>
                            <div onClick={handlePayment} className={cx('btn-payment')}>
                                <button id={cx('btn-buy')}>Hoàn Tất Đơn Hàng</button>
                            </div>
                        </div>

                        <div></div>
                    </div>
                    <div className={cx('total-product')}>
                        <h3>TỔNG CỘNG CÓ: {dataCart?.length} SẢN PHẨM</h3>
                        <div>
                            <table className="table table-bordered border-primary">
                                <thead>
                                    <tr>
                                        <th scope="col">Tạm tính</th>
                                        <th scope="col">{dataCart[0]?.totalPrice?.toLocaleString()}đ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Phí Vận Chuyển</td>
                                        <td>Miễn phí vận chuyển</td>
                                    </tr>
                                    <tr>
                                        <td>Giảm giá</td>
                                        <td>-{dataCart[0]?.discount?.toLocaleString() || 0} đ</td>
                                    </tr>
                                    <tr>
                                        <td>Tổng Cộng</td>
                                        <th>{dataCart[0]?.totalPrice?.toLocaleString()}đ</th>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className={cx('coupon')}>
                            <input
                                type="text"
                                placeholder="Nhập mã giảm giá"
                                value={nameCoupon}
                                onChange={(e) => setNameCoupon(e.target.value)}
                            />
                            <button onClick={handleApplyCoupon}>Áp dụng</button>
                        </div>
                        <div className={cx('img-product')}>
                            <h4 style={{ fontSize: '17px', fontWeight: '700', color: '#000' }}>SẢN PHẨM ĐÃ ĐẶT HÀNG</h4>
                            <div className={cx('img')}>
                                {dataCart?.map((item) => (
                                    <img
                                        key={item.id}
                                        src={`http://localhost:3000/uploads/images/${item.images[0]}`}
                                        alt={item.nameProduct}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Payments;
