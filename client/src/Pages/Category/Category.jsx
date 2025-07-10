import classNames from 'classnames/bind';
import styles from './Category.module.scss';

import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';

import CardBody from '../../Components/CardBody/CardBody';
import { useEffect, useState } from 'react';
import { requestGetProductByCategory } from '../../config/request';
import { useParams } from 'react-router-dom';

import { Select, Pagination } from 'antd';

const cx = classNames.bind(styles);

function Category() {
    const { id } = useParams();

    const [dataProducts, setDataProducts] = useState([]);
    const [dataProductsFilter, setDataProductsFilter] = useState([]);
    const [filter, setFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    useEffect(() => {
        const fetchData = async () => {
            const res = await requestGetProductByCategory(id);
            setDataProducts(res.metadata);
        };
        fetchData();
    }, [id]);

    const handleFilter = (value) => {
        setFilter(value);
        setCurrentPage(1);
    };

    useEffect(() => {
        if (filter === '1') {
            setDataProductsFilter([...dataProducts].sort((a, b) => a.price - b.price));
        } else if (filter === '2') {
            setDataProductsFilter([...dataProducts].sort((a, b) => b.price - a.price));
        } else {
            setDataProductsFilter([...dataProducts]);
        }
    }, [filter, dataProducts]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Get current products based on pagination
    const indexOfLastProduct = currentPage * pageSize;
    const indexOfFirstProduct = indexOfLastProduct - pageSize;
    const currentProducts =
        filter === ''
            ? dataProducts.slice(indexOfFirstProduct, indexOfLastProduct)
            : dataProductsFilter.slice(indexOfFirstProduct, indexOfLastProduct);

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <main className={cx('main')}>
                <h4 className={cx('title')}>Sản phẩm</h4>
                <div className={cx('select')}>
                    <Select
                        defaultValue="Lọc giá sản phẩm"
                        style={{ width: 220 }}
                        onChange={handleFilter}
                        options={[
                            { value: '1', label: 'Từ thấp đến cao' },
                            { value: '2', label: 'Từ cao đến thấp' },
                        ]}
                    />
                </div>

                {dataProducts.length > 0 ? (
                    <>
                        <div className={cx('products')}>
                            {currentProducts.map((item) => (
                                <CardBody key={item._id} item={item} />
                            ))}
                        </div>
                        <div className={cx('pagination')}>
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={filter === '' ? dataProducts.length : dataProductsFilter.length}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                            />
                        </div>
                    </>
                ) : (
                    <div className={cx('no-data')}>Không có sản phẩm</div>
                )}
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Category;
