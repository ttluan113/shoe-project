import { useState, useEffect } from 'react';
import { Table, Tag, Select, Space, Button, Modal, List, Typography } from 'antd';
import { EditOutlined, EyeOutlined, PrinterOutlined } from '@ant-design/icons';
import classNames from 'classnames/bind';
import styles from './OrderManager.module.scss';
import { requestGetPaymentsAdmin2, requestUpdatePayment } from '../../../../config/request';

const cx = classNames.bind(styles);
const { Option } = Select;
const { Text } = Typography;

function OrderManager() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [status, setStatus] = useState(null);

    const statusColors = {
        'Đang xử lý': 'processing',
        'Đang chuẩn bị hàng': 'warning',
        'Đang vận chuyển': 'warning',
        'Đã giao hàng': 'success',
        'Đã hủy': 'error',
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: '_id',
            key: '_id',
        },
        {
            title: 'Khách hàng',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalCartBefore',
            key: 'totalCartBefore',
            render: (price) => `${price.toLocaleString('vi-VN')}đ`,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={statusColors[status]}>{status}</Tag>,
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" icon={<EditOutlined />} onClick={() => handleEditOrder(record)}>
                        Cập nhật
                    </Button>
                    <Button type="default" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>
                        Chi tiết
                    </Button>
                </Space>
            ),
        },
    ];

    const fetchOrders = async () => {
        const res = await requestGetPaymentsAdmin2();
        setOrders(res.metadata);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleEditOrder = async (order) => {
        setSelectedOrder(order);

        setIsModalVisible(true);
    };

    const handleViewDetails = (order) => {
        setOrderDetails(order);
        setDetailsModalVisible(true);
    };

    const handleStatusChange = (value) => {
        setSelectedStatus(value);
    };

    const handleModalOk = async () => {
        // TODO: Implement update order status
        const data = {
            id: selectedOrder._id,
            status: status,
        };
        await requestUpdatePayment(data);
        fetchOrders();
        setIsModalVisible(false);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    const handleDetailsModalCancel = () => {
        setDetailsModalVisible(false);
    };

    const printInvoice = () => {
        if (!orderDetails) return;

        const printWindow = window.open('', '_blank');

        const products = orderDetails.products || orderDetails.product || [];

        let productsHtml = '';
        let totalAmount = 0;

        products.forEach((item, index) => {
            const productName = item.productDetail?.nameProduct || 'N/A';
            const price = item.productDetail?.price || 0;
            const quantity = item.quantity || 0;
            const subtotal = price * quantity;
            totalAmount += subtotal;

            productsHtml += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${productName}</td>
                    <td>${item.size || 'N/A'}</td>
                    <td>${quantity}</td>
                    <td>${price.toLocaleString('vi-VN')}đ</td>
                    <td>${subtotal.toLocaleString('vi-VN')}đ</td>
                </tr>
            `;
        });

        const discountAmount = orderDetails.nameCoupon ? orderDetails.totalCartBefore - totalAmount : 0;

        const invoiceHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Hóa đơn - ${orderDetails._id}</title>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        color: #333;
                    }
                    .invoice {
                        max-width: 800px;
                        margin: 0 auto;
                        border: 1px solid #eee;
                        padding: 20px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
                    }
                    .header {
                        border-bottom: 1px solid #eee;
                        padding-bottom: 20px;
                        display: flex;
                        justify-content: space-between;
                    }
                    .company-info {
                        text-align: right;
                    }
                    .invoice-details {
                        margin-top: 20px;
                        margin-bottom: 20px;
                    }
                    .customer-info {
                        margin-bottom: 20px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th, td {
                        padding: 8px 12px;
                        border-bottom: 1px solid #eee;
                        text-align: left;
                    }
                    th {
                        background-color: #f8f8f8;
                    }
                    .totals {
                        margin-top: 20px;
                        text-align: right;
                    }
                    .print-button {
                        text-align: center;
                        margin-top: 30px;
                    }
                    .print-button button {
                        padding: 10px 20px;
                        background-color: #1890ff;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    @media print {
                        .print-button {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="invoice">
                    <div class="header">
                        <div>
                            <h1>HÓA ĐƠN</h1>
                            <h3>Mã đơn hàng: ${orderDetails._id}</h3>
                        </div>
                        <div class="company-info">
                            <h2>SHOES NGOC VAN</h2>
                            <p>Địa chỉ: 123 Đường ABC, Quận XYZ</p>
                            <p>Điện thoại: 0123456789</p>
                            <p>Email: contact@shoesngocvan.com</p>
                        </div>
                    </div>
                    
                    <div class="invoice-details">
                        <p><strong>Ngày tạo:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
                        <p><strong>Trạng thái:</strong> ${orderDetails.status}</p>
                        <p><strong>Phương thức thanh toán:</strong> ${orderDetails.typePayment || 'N/A'}</p>
                    </div>
                    
                    <div class="customer-info">
                        <h3>Thông tin khách hàng</h3>
                        <p><strong>Tên khách hàng:</strong> ${orderDetails.fullName}</p>
                        <p><strong>Số điện thoại:</strong> ${orderDetails.phone}</p>
                        <p><strong>Địa chỉ giao hàng:</strong> ${orderDetails.address}</p>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Sản phẩm</th>
                                <th>Kích thước</th>
                                <th>Số lượng</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productsHtml}
                        </tbody>
                    </table>
                    
                    <div class="totals">
                        <p><strong>Tổng tiền hàng:</strong> ${totalAmount.toLocaleString('vi-VN')}đ</p>
                        ${
                            orderDetails.nameCoupon
                                ? `<p><strong>Mã giảm giá (${
                                      orderDetails.nameCoupon
                                  }):</strong> ${discountAmount.toLocaleString('vi-VN')}đ</p>`
                                : ''
                        }
                        <h3>Tổng thanh toán: ${orderDetails.totalCartBefore.toLocaleString('vi-VN')}đ</h3>
                    </div>
                    
                    <div class="print-button">
                        <button onclick="window.print()">In hóa đơn</button>
                    </div>
                </div>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(invoiceHtml);
        printWindow.document.close();
    };

    return (
        <div className={cx('order-manager')}>
            <div className={cx('header')}>
                <h2>Quản lý đơn hàng</h2>
                <Select defaultValue="all" style={{ width: 200 }} onChange={handleStatusChange}>
                    <Option value="all">Tất cả đơn hàng</Option>
                    <Option value="Đang xử lý">Đang xử lý</Option>
                    <Option value="Đang chuẩn bị hàng">Đang chuẩn bị hàng</Option>
                    <Option value="Đang vận chuyển">Đang vận chuyển</Option>
                    <Option value="Đã giao hàng">Đã giao hàng</Option>
                    <Option value="Đã hủy">Đã hủy</Option>
                </Select>
            </div>

            <Table columns={columns} dataSource={orders} loading={loading} rowKey="_id" pagination={{ pageSize: 10 }} />

            <Modal
                title="Cập nhật trạng thái đơn hàng"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
            >
                {selectedOrder && (
                    <div>
                        <p>Mã đơn hàng: {selectedOrder._id}</p>
                        <p>Khách hàng: {selectedOrder.fullName}</p>
                        <Select
                            defaultValue={selectedOrder.status}
                            style={{ width: '100%', marginTop: 16 }}
                            onChange={(value) => setStatus(value)}
                        >
                            <Option value="Đang xử lý">Đang xử lý</Option>
                            <Option value="Đang chuẩn bị hàng">Đang chuẩn bị hàng</Option>
                            <Option value="Đang vận chuyển">Đang vận chuyển</Option>
                            <Option value="Đã giao hàng">Đã giao hàng</Option>
                            <Option value="Đã hủy">Đã hủy</Option>
                        </Select>
                    </div>
                )}
            </Modal>

            <Modal
                title="Chi tiết đơn hàng"
                open={detailsModalVisible}
                onCancel={handleDetailsModalCancel}
                footer={[
                    <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={printInvoice}>
                        In hóa đơn
                    </Button>,
                    <Button key="back" onClick={handleDetailsModalCancel}>
                        Đóng
                    </Button>,
                ]}
                width={700}
            >
                {orderDetails && (
                    <div className={cx('order-details')}>
                        <div className={cx('customer-info')}>
                            <h3>Thông tin khách hàng</h3>
                            <p>
                                <strong>Khách hàng:</strong> {orderDetails.fullName}
                            </p>
                            <p>
                                <strong>Số điện thoại:</strong> {orderDetails.phone}
                            </p>
                            <p>
                                <strong>Địa chỉ:</strong> {orderDetails.address}
                            </p>
                            <p>
                                <strong>Tổng tiền:</strong> {orderDetails.totalCartBefore.toLocaleString('vi-VN')}đ
                            </p>
                            {orderDetails.nameCoupon && (
                                <p>
                                    <strong>Mã giảm giá:</strong> {orderDetails.nameCoupon}
                                </p>
                            )}
                            <p>
                                <strong>Phương thức thanh toán:</strong> {orderDetails.typePayment || 'N/A'}
                            </p>
                            <p>
                                <strong>Trạng thái:</strong>{' '}
                                <Tag color={statusColors[orderDetails.status]}>{orderDetails.status}</Tag>
                            </p>
                        </div>

                        <div className={cx('product-list')}>
                            <h3>Danh sách sản phẩm</h3>
                            <Table
                                dataSource={orderDetails.products || orderDetails.product}
                                rowKey={(record, index) => index}
                                pagination={false}
                                columns={[
                                    {
                                        title: 'STT',
                                        key: 'index',
                                        render: (_, __, index) => index + 1,
                                        width: 60,
                                    },

                                    {
                                        title: 'Tên sản phẩm',
                                        key: 'nameProduct',
                                        render: (record) => record.productDetail?.nameProduct || 'N/A',
                                    },
                                    {
                                        title: 'Số lượng',
                                        dataIndex: 'quantity',
                                        key: 'quantity',
                                        width: 100,
                                    },
                                    {
                                        title: 'Kích thước',
                                        dataIndex: 'size',
                                        key: 'size',
                                        width: 120,
                                    },
                                    {
                                        title: 'Giá',
                                        key: 'price',
                                        render: (record) =>
                                            record.productDetail?.price
                                                ? `${record.productDetail.price.toLocaleString('vi-VN')}đ`
                                                : 'N/A',
                                    },
                                ]}
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default OrderManager;
