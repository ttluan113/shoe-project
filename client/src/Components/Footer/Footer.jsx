import classNames from 'classnames/bind';
import styles from './Footer.module.scss';

import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function Footer() {
    const navigate = useNavigate();

    const onPage = (url) => {
        navigate(url);
    };

    return (
        <div className={cx('wrapper')}>
            <main>
                <div className={cx('inner')}>
                    <div className={cx('box-item')}>
                        <ul>
                            <li id={cx('item-title')}>NHÀ PHÂN PHỐI ĐỘC QUYỀN</li>
                            <li>CÔNG TY CP THỜI TRANG KingShoes</li>
                            <li>Cửa hàng KingShoes, 101 P. Lò Đúc, Phạm Đình Hổ, Hai Bà Trưng, Hà Nội</li>
                            <li>0774379436</li>
                        </ul>
                    </div>

                    <div className={cx('box-item')}>
                        <ul>
                            <li id={cx('item-title')}>DANH MỤC NỔI BẬT</li>
                            <li>Giới thiệu về KingShoes</li>
                            <li onClick={() => onPage('/category/giay-nam')}> Giày Nam</li>
                            <li onClick={() => onPage('/category/giay-nu')}> Giày Nữ</li>
                            <li onClick={() => onPage('/category/giay-tre-em')}>Giày Trẻ Em</li>
                        </ul>
                    </div>

                    <div className={cx('box-item')}>
                        <ul>
                            <li id={cx('item-title')}>CHÍNH SÁCH CÔNG TY</li>
                            <li>CÔNG TY CP THỜI TRANG KingShoes</li>
                            <li>Cửa hàng KingShoes, 101 P. Lò Đúc, Phạm Đình Hổ, Hai Bà Trưng, Hà Nội</li>
                            <li>07743794369</li>
                        </ul>
                    </div>

                    <div className={cx('box-item')}>
                        <ul>
                            <li id={cx('item-title')}>CHÍNH SÁCH CÔNG TY</li>
                            <li>CÔNG TY CP THỜI TRANG KingShoes</li>
                            <li>Cửa hàng KingShoes, 101 P. Lò Đúc, Phạm Đình Hổ, Hai Bà Trưng, Hà Nội</li>
                            <li>07743794369</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Footer;
