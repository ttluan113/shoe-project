import classNames from 'classnames/bind';
import styles from './CartUser.module.scss';

import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { message } from 'antd';
import { requestDeleteCart, requestUpdateQuantity } from '../../config/request';

const cx = classNames.bind(styles);

function CartUser() {
    const [dataProducts, setDataProducts] = useState([]);
    const navigate = useNavigate();

    const { dataCart, getCart } = useStore();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const newDataProducts = dataCart?.map((item) => item.products);
        setDataProducts(newDataProducts[0]);
    }, [dataCart]);

    const handleDeleteCart = async (id, size) => {
        const data = {
            idProduct: id,
            size: size,
        };
        const res = await requestDeleteCart(data);
        message.success(res.message);
        getCart();
    };

    const handleUpdateQuantity = async (id, size, quantity) => {
        try {
            const data = {
                idProduct: id,
                size: size,
                quantity: quantity,
            };
            const res = await requestUpdateQuantity(data);
            message.success(res.message);
            getCart();
        } catch (error) {
            message.destroy();
            message.error(error.response.data.message);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <main className={cx('main')}>
                <h2>Giỏ Hàng</h2>
                <div className={cx('inner')}>
                    {dataCart.length > 0 ? (
                        <div>
                            {dataCart?.map((item, index) => (
                                <div key={index} className={cx('cart-products')}>
                                    <div className={cx('img-product')}>
                                        <img src={`http://localhost:3000/uploads/images/${item?.images[0]}`} alt="" />
                                    </div>

                                    <div className={cx('info-product')}>
                                        <h2>{item?.nameProduct}</h2>

                                        <span style={{ fontSize: '17px', fontWeight: '700' }}>
                                            Số Lượng:{' '}
                                            <div className={cx('form-quantity')}>
                                                <button
                                                    onClick={() =>
                                                        handleUpdateQuantity(item?._id, item?.size, item?.quantity - 1)
                                                    }
                                                >
                                                    -
                                                </button>
                                                <input
                                                    id={cx('quantity')}
                                                    value={item?.quantity}
                                                    type="number"
                                                    onChange={(e) =>
                                                        handleUpdateQuantity(item?._id, item?.size, e.target.value)
                                                    }
                                                    min={1}
                                                    max={
                                                        item?.sizeProduct?.find(
                                                            (item) => Number(item.size) === Number(item?.size),
                                                        )?.quantity
                                                    }
                                                />
                                                <button
                                                    onClick={() =>
                                                        handleUpdateQuantity(item?._id, item?.size, item?.quantity + 1)
                                                    }
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </span>

                                        <span style={{ fontSize: '17px', fontWeight: '700' }}>Size: {item?.size}</span>

                                        <span style={{ fontSize: '14px', fontWeight: '700' }}>
                                            Còn lại trong kho:{' '}
                                            {
                                                item?.sizeProduct?.find(
                                                    (item2) => Number(item2.size) === Number(item?.size),
                                                )?.quantity
                                            }
                                        </span>
                                        <span id={cx('price')}>
                                            {(item?.price * item?.quantity).toLocaleString()} đ
                                        </span>
                                    </div>

                                    <div className={cx('remove-product')}>
                                        <button onClick={() => handleDeleteCart(item?._id, item?.size)}>
                                            <FontAwesomeIcon icon={faClose} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={cx('no-product')}>
                            <img src="https://static.topcv.vn/v4/image/job-list/none-result.png" alt="" />
                            <span>“Hổng” có gì trong giỏ hết!</span>
                        </div>
                    )}

                    <div className={cx('total-product')}>
                        <h3>TỔNG CỘNG CÓ: {dataCart?.length} SẢN PHẨM</h3>
                        <div>
                            <table className={cx('table table-bordered border-primary')}>
                                <thead>
                                    <tr>
                                        <th scope="col">Tạm tính</th>
                                        <th scope="col">{dataCart[0]?.totalPrice.toLocaleString()} đ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Phí Vận Chuyển</td>
                                        <td>Miễn phí vận chuyển</td>
                                    </tr>
                                    <tr>
                                        <td>Tổng Cộng</td>
                                        <th>{dataCart[0]?.totalPrice.toLocaleString()} đ</th>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className={cx('btn-total')}>
                            <button id={cx('btn-buy')}>
                                <Link to={'/payments'}>Tiến hành thanh toán</Link>
                            </button>
                            <button id={cx('btn-continue')}>
                                <Link to={'/category'}>Tiếp tục mua sắm</Link>
                            </button>
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

export default CartUser;
