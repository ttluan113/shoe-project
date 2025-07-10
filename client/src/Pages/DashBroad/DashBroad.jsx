import classNames from 'classnames/bind';
import styles from './DashBroad.module.scss';
import { useEffect, useState } from 'react';
import { requestAdmin } from '../../config/request';
import { Layout, Menu, Avatar, Dropdown, Badge, theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import {
    DashboardOutlined,
    AppstoreOutlined,
    ShoppingOutlined,
    UserOutlined,
    GiftOutlined,
    SettingOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';

// Import components
import Statistics from './components/Statistics/Statistics';
import CategoryManagement from './components/CategoryManagement/CategoryManagement';
import ProductManagement from './components/ProductManagement/ProductManagement';
import UserManagement from './components/UserManagement/UserManagement';
import CouponManagement from './components/CouponManagement/CouponManagement';
import OrderManagement from './components/OrderManager/OrderManager';

const { Header, Content, Sider } = Layout;
const cx = classNames.bind(styles);

function DashBroad() {
    const navigate = useNavigate();
    const [selectedMenu, setSelectedMenu] = useState('statistics');
    const [collapsed, setCollapsed] = useState(false);
    const { token } = theme.useToken();

    useEffect(() => {
        const fetchData = async () => {
            try {
                await requestAdmin();
            } catch (error) {
                navigate('/');
            }
        };
        fetchData();
    }, [navigate]);

    const renderContent = () => {
        switch (selectedMenu) {
            case 'statistics':
                return <Statistics />;
            case 'categories':
                return <CategoryManagement />;
            case 'products':
                return <ProductManagement />;
            case 'users':
                return <UserManagement />;
            case 'coupons':
                return <CouponManagement />;
            case 'orders':
                return <OrderManagement />;
            default:
                return <Statistics />;
        }
    };

    const menuItems = [
        {
            key: 'statistics',
            icon: <DashboardOutlined />,
            label: 'Thống kê website',
        },
        {
            key: 'categories',
            icon: <AppstoreOutlined />,
            label: 'Quản lý danh mục',
        },
        {
            key: 'products',
            icon: <ShoppingOutlined />,
            label: 'Quản lý sản phẩm',
        },
        {
            key: 'users',
            icon: <UserOutlined />,
            label: 'Quản lý người dùng',
        },
        {
            key: 'coupons',
            icon: <GiftOutlined />,
            label: 'Quản lý mã giảm giá',
        },
        {
            key: 'orders',
            icon: <ShoppingOutlined />,
            label: 'Quản lý đơn hàng',
        },
    ];

    const toggleSider = () => {
        setCollapsed(!collapsed);
    };

    return (
        <Layout className={cx('dashboard-layout')} style={{ background: token.colorBgContainer }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={250}
                className={cx('dashboard-sider')}
                theme="light"
            >
                <div className={cx('logo-container')}>
                    {!collapsed && <div className={cx('logo-text')}>Ngoc Van Shoes</div>}
                    {collapsed && <div className={cx('logo-icon')}>NVS</div>}
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[selectedMenu]}
                    items={menuItems}
                    onClick={({ key }) => setSelectedMenu(key)}
                    className={cx('dashboard-menu')}
                />
            </Sider>
            <Layout>
                <Header className={cx('dashboard-header')}>
                    <div className={cx('header-left')}>
                        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                            className: cx('trigger'),
                            onClick: toggleSider,
                        })}
                        <h2 className={cx('page-title')}>
                            {menuItems.find((item) => item.key === selectedMenu)?.label}
                        </h2>
                    </div>
                </Header>
                <Content className={cx('dashboard-content')}>
                    <div className={cx('content-container')}>{renderContent()}</div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default DashBroad;
