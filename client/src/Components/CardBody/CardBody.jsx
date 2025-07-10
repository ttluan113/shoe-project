import classNames from 'classnames/bind';
import styles from './CardBody.module.scss';

import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function CardBody({ item }) {
    return (
        <div className={cx('wrapper')}>
            <Link to={`/product/${item?._id}`}>
                <div className={cx('img')}>
                    <img src={`http://localhost:3000/uploads/images/${item?.images[0]}`} alt="" />
                </div>
            </Link>
            <Link style={{ textDecoration: 'none' }} to={`/product/${item?._id}`}>
                <div className={cx('info')}>
                    <h2>{item?.nameProduct}</h2>
                    <span>{item?.price?.toLocaleString()} đ</span>
                </div>
            </Link>
        </div>
    );
}

export default CardBody;
