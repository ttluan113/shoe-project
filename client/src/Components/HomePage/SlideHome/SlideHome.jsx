import classNames from 'classnames/bind';
import styles from './SlideHome.module.scss';

const cx = classNames.bind(styles);

import Slider from 'react-slick';

const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 2000,
};

import Banner1 from '../../../assets/images/banner1.webp';
import Banner2 from '../../../assets/images/banner2.webp';
import Banner3 from '../../../assets/images/banner3.webp';

import icon1 from '../../../assets/images/icon1.webp';
import icon2 from '../../../assets/images/icon2.webp';
import icon3 from '../../../assets/images/icon3.webp';
import icon4 from '../../../assets/images/icon4.webp';

function SlideHome() {
    return (
        <div className={cx('wrapper')}>
            <Slider {...settings}>
                <div className={cx('slide-item')}>
                    <img src={Banner1} alt="" />
                </div>

                <div className={cx('slide-item')}>
                    <img src={Banner2} alt="" />
                </div>

                <div className={cx('slide-item')}>
                    <img src={Banner3} alt="" />
                </div>
            </Slider>

            <div className={cx('icon-wrapper')}>
                <div className={cx('icon-item')}>
                    <img src={icon1} alt="" />
                    <div>
                        <h4>Miễn phí vận chuyển</h4>
                        <p>Cho đơn hàng từ 499k</p>
                    </div>
                </div>

                <div className={cx('icon-item')}>
                    <img src={icon2} alt="" />
                    <div>
                        <h4>Bảo hành 6 tháng</h4>
                        <p>15 ngày đổi trả</p>
                    </div>
                </div>

                <div className={cx('icon-item')}>
                    <img src={icon3} alt="" />
                    <div>
                        <h4>Thanh toán COD</h4>
                        <p>Yên tâm mua sắm</p>
                    </div>
                </div>

                <div className={cx('icon-item')}>
                    <img src={icon4} alt="" />
                    <div>
                        <h4>Hotline: 0866550286</h4>
                        <p>Dịch vụ hỗ trợ bạn 24/7</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SlideHome;
