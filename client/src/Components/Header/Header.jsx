import classNames from 'classnames/bind';
import styles from './Header.module.scss';

import logo from '../../assets/images/Logo.png';

import { UserOutlined, ShoppingOutlined, LogoutOutlined } from '@ant-design/icons';
import { Avatar, Dropdown } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useStore } from '../../hooks/useStore';

import { useEffect, useState } from 'react';

import useDebounce from '../../hooks/useDebounce';
import { requestLogout, requestSearchProduct } from '../../config/request';

const cx = classNames.bind(styles);

function Header() {
    const { dataCategory } = useStore();

    const { dataUser, dataCart } = useStore();

    const [dataSearch, setDataSearch] = useState([]);
    const [searchValue, setSearchValue] = useState('');

    const debounce = useDebounce(searchValue, 500);

    useEffect(() => {
        const fetchData = async () => {
            const res = await requestSearchProduct(debounce);
            setDataSearch(res.metadata);
        };
        if (debounce.length > 0) {
            fetchData();
        }
    }, [debounce]);

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await requestLogout();
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            navigate('/');
        } catch (error) {
            console.log(error);
        }
    };

    const items = [
        {
            key: '1',
            label: <Link to="/profile">Thông tin tài khoản</Link>,
            icon: <UserOutlined />,
        },
        {
            key: '2',
            label: <Link to="/orders">Đơn hàng của tôi</Link>,
            icon: <ShoppingOutlined />,
        },
        ...(dataUser.isAdmin
            ? [
                  {
                      key: '3',
                      label: <Link to="/admin">Quản lý website</Link>,
                      icon: <UserOutlined />,
                  },
              ]
            : []),
        {
            key: '4',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: async () => {
                await handleLogout();
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                navigate('/');
            },
        },
    ];

    return (
        <div className={cx('wrapper')}>
            <div className={cx('inner')}>
                <div className={cx('logo')}>
                    <Link to={'/'}>
                        <img src={logo} alt="logo" />
                    </Link>
                    <div>
                        <ul>
                            <Link style={{ textDecoration: 'none', paddingTop: '15px' }} to={'/category/all'}>
                                <li id={cx('category-item')}>Tất cả sản phẩm</li>
                            </Link>

                            {dataCategory.map((item) => (
                                <Link
                                    style={{ textDecoration: 'none', paddingTop: '15px' }}
                                    to={`/category/${item._id}`}
                                    key={item._id}
                                >
                                    <li id={cx('category-item')} key={item._id}>
                                        {item.nameCategory}
                                    </li>
                                </Link>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className={cx('search')}>
                    <div className={cx('search-input')}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            onChange={(e) => setSearchValue(e.target.value)}
                            value={searchValue}
                        />
                        <button>
                            <FontAwesomeIcon icon={faSearch} />
                        </button>

                        {searchValue.length > 0 && (
                            <div className={cx('result')}>
                                {dataSearch && dataSearch.length > 0 ? (
                                    <>
                                        {dataSearch.slice(0, 4).map((item) => (
                                            <Link
                                                style={{ textDecoration: 'none' }}
                                                to={`/product/${item._id}`}
                                                key={item._id}
                                                onClick={() => setSearchValue('')}
                                            >
                                                <div className={cx('form-result')}>
                                                    {dataSearch.length === 1 &&
                                                    item.name === 'Không Tìm Thấy Sản Phẩm !!!' ? (
                                                        <img src={`${item?.img}`} alt="" />
                                                    ) : (
                                                        <img
                                                            src={`http://localhost:3000/uploads/images/${item?.images[0]}`}
                                                            alt={item.nameProduct || ''}
                                                        />
                                                    )}
                                                    <div className={cx('product-text')}>
                                                        <span className={cx('product-name')}>{item.nameProduct}</span>
                                                        {dataSearch.length === 1 &&
                                                        item.name === 'Không Tìm Thấy Sản Phẩm !!!' ? (
                                                            <></>
                                                        ) : (
                                                            <span id={cx('price')}>
                                                                {item.price?.toLocaleString()} đ
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                        {dataSearch.length > 0 &&
                                            dataSearch[0].name !== 'Không Tìm Thấy Sản Phẩm !!!' && (
                                                <Link
                                                    style={{ textDecoration: 'none' }}
                                                    to={`/searchproduct/${searchValue}`}
                                                >
                                                    <div className={cx('view-more')}>Xem thêm sản phẩm</div>
                                                </Link>
                                            )}
                                    </>
                                ) : (
                                    <div className={cx('no-results')}>
                                        <div className={cx('no-results-content')}>
                                            <span>Không tìm thấy sản phẩm nào</span>
                                            <span className={cx('search-term')}>"{searchValue}"</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {!dataUser._id ? (
                        <div className={cx('login-btn')}>
                            <Link style={{ textDecoration: 'none' }} to={'/login'}>
                                Đăng Nhập
                            </Link>
                        </div>
                    ) : (
                        <div className={cx('user-menu')}>
                            <div className={cx('cart-menu')}>
                                <Link to="/cart" className={cx('cart-button')}>
                                    <ShoppingOutlined style={{ fontSize: '24px' }} />
                                    Giỏ hàng ({dataCart?.length})
                                </Link>
                            </div>
                            <Dropdown menu={{ items }} placement="bottomRight" arrow>
                                <div className={cx('user-avatar')}>
                                    {dataUser.avatar ? (
                                        <Avatar src={dataUser.avatar} size={40} />
                                    ) : (
                                        <Avatar
                                            size={40}
                                            icon={<UserOutlined />}
                                            style={{
                                                backgroundColor: '#87d068',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        />
                                    )}
                                </div>
                            </Dropdown>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Header;
