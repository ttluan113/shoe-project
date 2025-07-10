import classNames from 'classnames/bind';
import styles from './InfoUser.module.scss';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEnvelope,
    faLock,
    faMoneyCheckDollar,
    faPhone,
    faUser,
    faShoppingBag,
    faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { requestGetPaymentsUser, requestLogout, requestCancelOrder } from '../../config/request';
import {
    Table,
    Tag,
    Typography,
    Tooltip,
    Image,
    Tabs,
    Avatar,
    Card,
    Descriptions,
    Empty,
    Modal,
    Button,
    message,
} from 'antd';

const cx = classNames.bind(styles);

function InfoUser() {
    const [dataPayments, setDataPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('account');
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [tabPosition, setTabPosition] = useState('left');
    const [cancelModalData, setCancelModalData] = useState(null);

    const { dataUser } = useStore();

    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setTabPosition(window.innerWidth < 576 ? 'top' : 'left');
        };

        handleResize(); // Set initial value
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await requestGetPaymentsUser();
            setDataPayments(res.metadata);
        } catch (error) {
            console.error('Error fetching payment data:', error);
            message.error('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleLogOut = async () => {
        try {
            await requestLogout();
            setLogoutModalOpen(false);
            message.success('Đăng xuất thành công');
            // Clear local storage or any other logout logic
            localStorage.removeItem('user');
            setTimeout(() => {
                navigate('/login');
            }, 500);
        } catch (error) {
            message.error('Đăng xuất thất bại');
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCancelOrder = async () => {
        if (!cancelModalData) return;

        setCancelLoading(true);
        try {
            const data = {
                idOrder: cancelModalData._id,
            };
            await requestCancelOrder(data);
            message.success('Hủy đơn hàng thành công');
            setCancelModalData(null);
            // Refresh orders list
            fetchOrders();
        } catch (error) {
            console.error('Error cancelling order:', error);
            message.error(error.response?.data?.message || 'Không thể hủy đơn hàng');
        } finally {
            setCancelLoading(false);
        }
    };

    // Table columns configuration
    const columns = [
        {
            title: 'Mã Đơn Hàng',
            dataIndex: '_id',
            key: '_id',
            render: (id) => (
                <Tooltip title={id}>
                    <Typography.Text copyable={{ text: id }} style={{ cursor: 'pointer' }}>
                        {id.slice(0, 8)}...
                    </Typography.Text>
                </Tooltip>
            ),
        },
        {
            title: 'Sản Phẩm',
            dataIndex: 'products',
            key: 'products',
            render: (products) => (
                <div className={cx('product-info')}>
                    {products && products.length > 0 ? (
                        <div>
                            {products.map((item, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        marginBottom: index < products.length - 1 ? '10px' : 0,
                                        borderBottom: index < products.length - 1 ? '1px solid #f0f0f0' : 'none',
                                        paddingBottom: index < products.length - 1 ? '10px' : 0,
                                    }}
                                >
                                    <Image
                                        src={`http://localhost:3000/uploads/images/${item.productDetail?.images[0]}`}
                                        alt={item.productDetail?.nameProduct}
                                        style={{ width: 50, height: 50, objectFit: 'cover' }}
                                        preview={false}
                                    />
                                    <div>
                                        <Typography.Text strong>{item.productDetail?.nameProduct}</Typography.Text>
                                        <div className={cx('product-details')}>
                                            <Typography.Text type="secondary">
                                                Size: {item.size} | SL: {item.quantity}
                                            </Typography.Text>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Typography.Text type="secondary">Không có thông tin sản phẩm</Typography.Text>
                    )}
                </div>
            ),
        },
        {
            title: 'Ngày Đặt Hàng',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Tổng Tiền',
            dataIndex: 'totalCartBefore',
            key: 'totalCartBefore',
            render: (total) => <Typography.Text strong>{Number(total).toLocaleString()} đ</Typography.Text>,
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'processing';
                let text = status;

                if (status === 'Đã giao hàng') {
                    color = 'success';
                } else if (status === 'Đã hủy') {
                    color = 'error';
                } else if (status === 'Đang vận chuyển') {
                    color = 'warning';
                } else if (status === 'Đang chuẩn bị hàng') {
                    color = 'warning';
                } else if (status === 'Đang xử lý') {
                    color = 'default';
                }

                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'Hành Động',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => {
                const canCancel = record.status === 'Đã huỷ' || record.status === 'Đang xử lý';
                return (
                    <Button danger type="primary" disabled={!canCancel} onClick={() => setCancelModalData(record)}>
                        Huỷ đơn hàng
                    </Button>
                );
            },
        },
    ];

    // Tab items
    const items = [
        {
            key: 'account',
            label: (
                <span className={cx('tab-label')}>
                    <FontAwesomeIcon icon={faUser} className={cx('tab-icon')} />
                    Thông Tin Tài Khoản
                </span>
            ),
            children: (
                <div className={cx('account-info-tab')}>
                    <Card className={cx('user-profile-card')}>
                        <div className={cx('user-profile-header')}>
                            <Avatar
                                size={100}
                                src="https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o="
                                className={cx('user-avatar')}
                            />
                            <Typography.Title level={3} className={cx('user-name')}>
                                {dataUser?.fullname || 'Khách hàng'}
                            </Typography.Title>
                        </div>

                        <Descriptions
                            bordered
                            column={1}
                            className={cx('user-details')}
                            labelStyle={{ fontWeight: 600 }}
                        >
                            <Descriptions.Item label="Email">
                                <FontAwesomeIcon icon={faEnvelope} className={cx('desc-icon')} />
                                {dataUser?.email || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mật khẩu">
                                <FontAwesomeIcon icon={faLock} className={cx('desc-icon')} />
                                **********
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                <FontAwesomeIcon icon={faPhone} className={cx('desc-icon')} />
                                {dataUser?.phone ? `0${dataUser.phone}` : 'N/A'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </div>
            ),
        },
        {
            key: 'orders',
            label: (
                <span className={cx('tab-label')}>
                    <FontAwesomeIcon icon={faShoppingBag} className={cx('tab-icon')} />
                    Đơn Hàng Của Bạn
                </span>
            ),
            children: (
                <div className={cx('orders-tab')}>
                    <Card className={cx('orders-card')} title="Lịch sử đơn hàng">
                        {dataPayments && dataPayments.length > 0 ? (
                            <Table
                                dataSource={dataPayments}
                                columns={columns}
                                rowKey="_id"
                                loading={loading}
                                pagination={{
                                    pageSize: 5,
                                    showTotal: (total) => `Tổng ${total} đơn hàng`,
                                    showSizeChanger: true,
                                    pageSizeOptions: ['5', '10', '20'],
                                }}
                                bordered
                                className={cx('orders-table')}
                            />
                        ) : (
                            <Empty description="Bạn chưa có đơn hàng nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </Card>
                </div>
            ),
        },
        {
            key: 'logout',
            label: (
                <span className={cx('tab-label')}>
                    <FontAwesomeIcon icon={faSignOutAlt} className={cx('tab-icon')} />
                    Đăng Xuất
                </span>
            ),
            children: (
                <div className={cx('logout-tab')}>
                    <Card className={cx('logout-card')}>
                        <div className={cx('logout-content')}>
                            <FontAwesomeIcon icon={faSignOutAlt} className={cx('logout-icon')} />
                            <Typography.Title level={4}>Bạn có chắc chắn muốn đăng xuất?</Typography.Title>
                            <Typography.Paragraph>
                                Sau khi đăng xuất, bạn sẽ cần đăng nhập lại để tiếp tục mua sắm và theo dõi đơn hàng.
                            </Typography.Paragraph>
                            <Button
                                type="primary"
                                danger
                                size="large"
                                onClick={() => setLogoutModalOpen(true)}
                                className={cx('logout-button')}
                            >
                                Đăng Xuất
                            </Button>
                        </div>
                    </Card>
                </div>
            ),
        },
    ];

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <main className={cx('main')}>
                <div className={cx('info-user')}>
                    <h2 className={cx('page-title')}>Quản Lý Tài Khoản</h2>

                    <Tabs
                        defaultActiveKey="account"
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={items}
                        tabPosition={tabPosition}
                        className={cx('account-tabs')}
                    />

                    <Modal
                        title="Xác nhận đăng xuất"
                        open={logoutModalOpen}
                        onOk={handleLogOut}
                        onCancel={() => setLogoutModalOpen(false)}
                        okText="Đăng xuất"
                        cancelText="Hủy"
                    >
                        <p>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?</p>
                    </Modal>

                    <Modal
                        title="Xác nhận hủy đơn hàng"
                        open={!!cancelModalData}
                        onOk={handleCancelOrder}
                        confirmLoading={cancelLoading}
                        onCancel={() => setCancelModalData(null)}
                        okText="Xác nhận hủy"
                        cancelText="Đóng"
                        okButtonProps={{ danger: true }}
                    >
                        {cancelModalData && (
                            <>
                                <p>Bạn có chắc chắn muốn hủy đơn hàng này?</p>
                                <p>
                                    <strong>Mã đơn hàng:</strong> {cancelModalData._id}
                                </p>
                                <div className={cx('modal-products')}>
                                    <strong>Sản phẩm ({cancelModalData.products?.length || 0}):</strong>
                                    <ul className={cx('modal-product-list')}>
                                        {cancelModalData.products?.map((item, index) => (
                                            <li key={index}>
                                                {item.productDetail?.nameProduct} - Size: {item.size} - SL:{' '}
                                                {item.quantity}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <p>
                                    <strong>Tổng tiền:</strong>{' '}
                                    {Number(cancelModalData.totalCartBefore).toLocaleString()} đ
                                </p>
                                <p className={cx('warning-text')}>
                                    <strong>Lưu ý:</strong> Hành động này không thể hoàn tác!
                                </p>
                            </>
                        )}
                    </Modal>
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default InfoUser;
