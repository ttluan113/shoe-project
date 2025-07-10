import classNames from 'classnames/bind';
import styles from './DetailProducts.module.scss';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';

import { useEffect, useState } from 'react';

import CardBody from '../../Components/CardBody/CardBody';
import Slider from 'react-slick';
import { useParams } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { requestAddCart, requestGetProductById } from '../../config/request';

import { message } from 'antd';

const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    initialSlide: 0,
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
                infinite: true,
                dots: true,
            },
        },
        {
            breakpoint: 600,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
                initialSlide: 0,
            },
        },
        {
            breakpoint: 500,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                initialSlide: 0,
                centerMode: true,
                centerPadding: '20px',
            },
        },
    ],
};

const cx = classNames.bind(styles);

function DetailProducts() {
    const { id } = useParams();

    const [dataProduct, setDataProduct] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [selectImg, setSelectImg] = useState(0);
    const [selectSize, setSelectSize] = useState('');
    const [dataCoupon, setDataCoupon] = useState([]);

    const [similarProduct, setSimilarProduct] = useState([]);

    const { getCart } = useStore();

    const onCoppyCoupon = (nameCoupon) => {
        navigator.clipboard.writeText(nameCoupon);
        message.success('Coppy Coupon thành công');
    };

    const fetchData = async () => {
        const res = await requestGetProductById(id);
        setDataProduct(res.metadata.data);
        setSimilarProduct(res.metadata.productSimilar);
        setDataCoupon(res.metadata.dataCoupon);
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    useEffect(() => {
        if (quantity < 1) {
            setQuantity(1);
        }
    }, [quantity]);

    const handleImgClick = (index) => {
        setSelectImg(index);
    };

    const handleAddProduct = async () => {
        if (!selectSize) {
            return message.error('Vui lòng chọn size');
        }
        try {
            const data = {
                productId: dataProduct._id,
                size: selectSize,
                quantity,
            };
            const res = await requestAddCart(data);
            message.success(res.message);
            getCart();
            fetchData();
        } catch (error) {
            message.error(error.response.data.message);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const handleChangeQuantity = (e, item) => {
        if (e === '-') {
            setQuantity(quantity - 1);
            if (quantity < 1) {
                setQuantity(1);
            }
        }
        if (e === '+') {
            setQuantity(quantity + 1);
            if (quantity >= item.size.find((item) => Number(item.size) === Number(selectSize))?.quantity) {
                setQuantity(item.size.find((item) => Number(item.size) === Number(selectSize))?.quantity);
            }
        }
    };

    const handleInputQuantity = (e, item) => {
        const value = parseInt(e.target.value) || 1;
        const maxQuantity = item.size.find((item) => Number(item.size) === Number(selectSize))?.quantity || 1;

        if (value < 1) {
            setQuantity(1);
        } else if (value > maxQuantity) {
            setQuantity(maxQuantity);
        } else {
            setQuantity(value);
        }
    };

    useEffect(() => {
        const product = dataProduct?.size?.find((item) => item.size === selectSize);
        if (product) {
            setQuantity(1);
        }
    }, [selectSize, dataProduct]);

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <main className={cx('main')}>
                <div className={cx('form-product')}>
                    <div className={cx('img-product')}>
                        <div className={cx('img-small')}>
                            {dataProduct?.images?.map((item2, index) => (
                                <img
                                    className={cx({ active: index === selectImg })}
                                    key={index}
                                    onClick={() => handleImgClick(index)}
                                    src={`http://localhost:3000/uploads/images/${item2}`}
                                    alt=""
                                />
                            ))}
                        </div>

                        <img
                            className={cx('img')}
                            src={`http://localhost:3000/uploads/images/${
                                dataProduct?.images && dataProduct.images[selectImg]
                            }`}
                            alt=""
                        />
                    </div>
                    <div className={cx('info-product')}>
                        <div className={cx('title-product')}>
                            <h2>{dataProduct.nameProduct}</h2>
                            <span>{dataProduct.price?.toLocaleString()} đ</span>
                        </div>
                        <div className={cx('select-size')}>
                            <div className={cx('select-size')}>
                                <span>Kích Cỡ : {selectSize}</span>
                                <div className={cx('form-size')}>
                                    {dataProduct.size?.map((item) => (
                                        <div
                                            key={item._id}
                                            onClick={() => setSelectSize(item.size)}
                                            className={cx(selectSize === item.size ? 'active' : '')}
                                        >
                                            <button>{item.size}</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className={cx('form-quantity')}>
                                <button onClick={() => handleChangeQuantity('-', dataProduct)}>-</button>
                                <input
                                    id={cx('quantity')}
                                    value={quantity}
                                    onChange={(e) => handleInputQuantity(e, dataProduct)}
                                    type="number"
                                    min={1}
                                    max={
                                        dataProduct.size?.find((item) => Number(item.size) === Number(selectSize))
                                            ?.quantity
                                    }
                                />
                                <button onClick={() => handleChangeQuantity('+', dataProduct)}>+</button>
                            </div>
                        </div>

                        <div className={cx('color-options')}>
                            <h3>Mã giảm giá</h3>
                            {dataCoupon.length > 0 ? (
                                dataCoupon.map((item) => (
                                    <button
                                        key={item._id}
                                        onClick={() => onCoppyCoupon(item.nameCoupon)}
                                        className={cx('color-btn')}
                                    >
                                        {item.nameCoupon} - Giảm {item.discount?.toLocaleString()}đ
                                    </button>
                                ))
                            ) : (
                                <p>Không có mã giảm giá phù hợp</p>
                            )}
                        </div>
                        <p style={{ marginTop: '10px', fontWeight: 500 }}>
                            Còn lại:{' '}
                            <span style={{ color: 'red' }}>
                                {dataProduct.size?.find((item) => Number(item.size) === Number(selectSize))?.quantity}
                            </span>{' '}
                            sản phẩm
                        </p>

                        <div className={cx('btn-add-cart')}>
                            <button onClick={() => handleAddProduct(dataProduct)}>Thêm Vào Giỏ Hàng</button>
                        </div>
                        <div className={cx('container')}>
                            <div className={cx('box')}>
                                <img
                                    src="https://theme.hstatic.net/200000940675/1001304908/14/policies_icon_1.png?v=187"
                                    alt=""
                                />
                                <div id={cx('info')}>
                                    <span style={{ fontWeight: '800' }}>Miễn phí vận chuyển</span>
                                    <span>Cho đơn hàng từ 800k</span>
                                </div>
                            </div>

                            <div className={cx('box')}>
                                <img
                                    src="https://theme.hstatic.net/200000940675/1001304908/14/policies_icon_2.png?v=187"
                                    alt=""
                                />
                                <div id={cx('info')}>
                                    <span style={{ fontWeight: '800' }}>Bảo hành 6 tháng</span>
                                    <span>15 ngày đổi trả</span>
                                </div>
                            </div>

                            <div className={cx('box')}>
                                <img
                                    src="https://theme.hstatic.net/200000940675/1001304908/14/policies_icon_3.png?v=187"
                                    alt=""
                                />
                                <div id={cx('info')}>
                                    <span style={{ fontWeight: '800' }}>Thanh toán COD</span>
                                    <span>Yên tâm mua sắm</span>
                                </div>
                            </div>

                            <div className={cx('box')}>
                                <img
                                    src="https://theme.hstatic.net/200000940675/1001304908/14/policies_icon_4.png?v=187"
                                    alt=""
                                />
                                <div id={cx('info')}>
                                    <span style={{ fontWeight: '800' }}>Hotline: 0866550286</span>
                                    <span>Hỗ trợ bạn 24/7</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {dataProduct && dataProduct.description && (
                    <div className={cx('description')}>
                        <div>
                            <h2>THÔNG TIN SẢN PHẨM</h2>
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: dataProduct.description }} />
                    </div>
                )}

                <div>
                    <div>
                        <h4 id={cx('title-similar-product')}>SẢN PHẨM TƯƠNG TỰ</h4>
                    </div>
                    <div>
                        <Slider {...settings}>
                            {similarProduct.slice(0, 8).map((item) => (
                                <div key={item?._id}>
                                    <div>
                                        <CardBody item={item} />
                                    </div>
                                </div>
                            ))}
                        </Slider>
                    </div>
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default DetailProducts;
