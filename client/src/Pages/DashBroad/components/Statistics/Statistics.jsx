import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, DatePicker, Progress, Tooltip, Badge } from 'antd';
import {
    ShoppingCartOutlined,
    UserOutlined,
    DollarOutlined,
    ShoppingOutlined,
    InfoCircleOutlined,
} from '@ant-design/icons';
import classNames from 'classnames/bind';
import styles from './Statistics.module.scss';
import { Column } from '@ant-design/charts';
import {
    requestGetPaymentsAdmin,
    requestGetRevenue,
    requestGetStatisticProduct,
    requestTotalWebsite,
} from '../../../../config/request';

import dayjs from 'dayjs';

const cx = classNames.bind(styles);

function Statistics() {
    const [revenue7Days, setRevenue7Days] = useState([]);
    const [bestSellingProducts, setBestSellingProducts] = useState([]);
    const [paymentsAdmin, setPaymentsAdmin] = useState([]);
    const [totalWebsite, setTotalWebsite] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            const res = await requestGetStatisticProduct();
            const res1 = await requestGetRevenue();
            const res2 = await requestGetPaymentsAdmin();
            const res3 = await requestTotalWebsite();
            setBestSellingProducts(res);
            setRevenue7Days(res1);
            setPaymentsAdmin(res2.metadata);
            setTotalWebsite(res3.metadata);
        };
        fetchData();
    }, []);

    // Mock data
    const statisticsData = {
        totalRevenue: 52680000,
        totalOrders: 124,
        totalUsers: 68,
        totalProducts: 45,
        revenueIncrease: 12.5,
        ordersIncrease: 8.3,
        usersIncrease: 15.2,
        productsIncrease: -3.7,
    };

    const orderStatusColors = {
        completed: 'success',
        processing: 'processing',
        pending: 'warning',
        cancelled: 'error',
        delivered: 'default',
    };

    const orderColumns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: '_id',
            key: '_id',
        },
        {
            title: 'Khách hàng',
            dataIndex: 'user',
            key: 'user',
            render: (user) => <span>{user.fullName}</span>,
        },
        {
            title: 'Ngày',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Số tiền',
            dataIndex: 'totalCartBefore',
            key: 'totalCartBefore',
            render: (amount) => <span className={cx('amount')}>{amount.toLocaleString('vi-VN')}đ</span>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <span className={cx('status')}>{status}</span>,
        },
    ];

    const productColumns = [
        {
            title: 'Tên sản phẩm',
            dataIndex: 'nameProduct',
            key: 'nameProduct',
        },
    ];

    // Dữ liệu doanh thu 7 ngày gần nhất (có thể thay bằng API thực tế)

    const columnConfig = {
        data: revenue7Days,
        xField: '_id',
        yField: 'totalRevenue',
        label: {
            position: 'middle',
            style: { fill: '#fff' },
            formatter: (v) => `${(v / 1000000).toFixed(1)}tr`,
        },
        xAxis: {
            label: { autoHide: true, autoRotate: false },
        },
        yAxis: {
            label: {
                formatter: (v) => `${(v / 1000000).toFixed(1)}tr`,
            },
        },
        color: '#1890ff',
        columnWidthRatio: 0.6,
        tooltip: { formatter: (datum) => ({ name: 'Doanh thu', value: `${datum.revenue.toLocaleString('vi-VN')}đ` }) },
    };

    return (
        <div className={cx('statistics')}>
            <Card title="Doanh thu 7 ngày gần nhất" className={cx('chart-card')} style={{ marginBottom: 24 }}>
                <Column {...columnConfig} />
            </Card>

            <div className={cx('header')}>
                <h2>Thống kê website</h2>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={cx('statistic-card', 'revenue-card')}>
                        <Statistic
                            title={
                                <div className={cx('statistic-title')}>
                                    <span>Tổng doanh thu</span>
                                    <Tooltip title="Tổng doanh thu từ tất cả đơn hàng">
                                        <InfoCircleOutlined className={cx('info-icon')} />
                                    </Tooltip>
                                </div>
                            }
                            value={totalWebsite.totalPayments}
                            formatter={(value) => `${value.toLocaleString('vi-VN')}đ`}
                            prefix={<DollarOutlined className={cx('revenue-icon')} />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={cx('statistic-card', 'orders-card')}>
                        <Statistic
                            title={
                                <div className={cx('statistic-title')}>
                                    <span>Tổng đơn hàng</span>
                                    <Tooltip title="Tổng số đơn hàng đã nhận">
                                        <InfoCircleOutlined className={cx('info-icon')} />
                                    </Tooltip>
                                </div>
                            }
                            value={totalWebsite.totalOrder}
                            prefix={<ShoppingCartOutlined className={cx('orders-icon')} />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                        <div className={cx('comparison')}></div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={cx('statistic-card', 'users-card')}>
                        <Statistic
                            title={
                                <div className={cx('statistic-title')}>
                                    <span>Tổng khách hàng</span>
                                    <Tooltip title="Tổng số người dùng đã đăng ký">
                                        <InfoCircleOutlined className={cx('info-icon')} />
                                    </Tooltip>
                                </div>
                            }
                            value={totalWebsite.totalUser}
                            prefix={<UserOutlined className={cx('users-icon')} />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={cx('statistic-card', 'products-card')}>
                        <Statistic
                            title={
                                <div className={cx('statistic-title')}>
                                    <span>Tổng sản phẩm</span>
                                    <Tooltip title="Tổng số sản phẩm trong cửa hàng">
                                        <InfoCircleOutlined className={cx('info-icon')} />
                                    </Tooltip>
                                </div>
                            }
                            value={totalWebsite.totalProduct}
                            prefix={<ShoppingOutlined className={cx('products-icon')} />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} className={cx('tables-row')}>
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <div className={cx('card-title')}>
                                <ShoppingCartOutlined className={cx('title-icon')} />
                                Đơn hàng gần đây
                            </div>
                        }
                        className={cx('table-card')}
                    >
                        <Table
                            dataSource={paymentsAdmin}
                            columns={orderColumns}
                            pagination={false}
                            className={cx('data-table')}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <div className={cx('card-title')}>
                                <ShoppingOutlined className={cx('title-icon')} />
                                Sản phẩm bán chạy
                            </div>
                        }
                        className={cx('table-card')}
                    >
                        <Table
                            dataSource={bestSellingProducts}
                            columns={productColumns}
                            pagination={false}
                            className={cx('data-table')}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default Statistics;
