import Footer from '../../Components/Footer/Footer';
import Header from '../../Components/Header/Header';

import classNames from 'classnames/bind';
import styles from './SearchProduct.module.scss';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { requestSearchProduct } from '../../config/request';
import CardBody from '../../Components/CardBody/CardBody';
import { Pagination } from 'antd';
const cx = classNames.bind(styles);

function SearchProduct() {
    const { nameProduct } = useParams();

    const [dataSearch, setDataSearch] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8; // Number of products per page

    useEffect(() => {
        const fetchData = async () => {
            const res = await requestSearchProduct(nameProduct);
            setDataSearch(res.metadata);
            setCurrentPage(1); // Reset to first page when search changes
        };
        fetchData();
    }, [nameProduct]);

    // Calculate current products to display
    const indexOfLastProduct = currentPage * pageSize;
    const indexOfFirstProduct = indexOfLastProduct - pageSize;
    const currentProducts = dataSearch.slice(indexOfFirstProduct, indexOfLastProduct);

    // Change page handler
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>
            <h4 className={cx('title')}>Sản phẩm</h4>
            <h4 className={cx('title-2')}>Có {dataSearch.length} kết quả tìm kiếm</h4>

            <main className={cx('container')}>
                {currentProducts.map((item) => (
                    <CardBody key={item._id} item={item} />
                ))}
            </main>

            {dataSearch.length > 0 && (
                <div className={cx('pagination')}>
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={dataSearch.length}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                    />
                </div>
            )}

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default SearchProduct;
