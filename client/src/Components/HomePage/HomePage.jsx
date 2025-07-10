import classNames from 'classnames/bind';
import styles from './HomePage.module.scss';

import SlideHome from './SlideHome/SlideHome';
import CardBody from '../CardBody/CardBody';
import Introduce from './Introduce/Introduce';
import { useEffect, useState } from 'react';
import { requestGetAllProduct } from '../../config/request';

import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function HomePage() {
    const [data, setData] = useState([]);

    console.log(data);

    useEffect(() => {
        const fetchData = async () => {
            const res = await requestGetAllProduct();
            setData(res.metadata);
        };
        fetchData();
    }, []);

    return (
        <div className={cx('wrapper')}>
            <div>
                <SlideHome />
            </div>
            {data
                .filter((item) => item?.products?.length > 0)
                .map((item) => (
                    <div className={cx('card-body-wrapper')}>
                        <div className={cx('card-body-header')}>
                            <h4 id={cx('card-body-header-title')}>{item.nameCategory}</h4>
                            <Link to={`/category/${item._id}`}>
                                <button>Xem tất cả</button>
                            </Link>
                        </div>

                        <div className={cx('card-body')}>
                            {item.products.slice(0, 8).map((item) => (
                                <CardBody key={item._id} item={item} />
                            ))}
                        </div>
                    </div>
                ))}
            <div style={{ width: '90%', margin: '50px auto' }}>
                <Introduce />
            </div>
        </div>
    );
}

export default HomePage;
