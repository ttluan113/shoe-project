import React, { useEffect, useState } from 'react';
import {
    Table,
    Card,
    Button,
    Modal,
    Form,
    Input,
    Switch,
    message,
    Space,
    Tag,
    Tooltip,
    Avatar,
    Popconfirm,
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    LockOutlined,
    PhoneOutlined,
    MailOutlined,
    PlusOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from '@ant-design/icons';
import classNames from 'classnames/bind';
import styles from './UserManagement.module.scss';
import { requestGetAllUser, requestUpdateUser } from '../../../../config/request';
import dayjs from 'dayjs';

const cx = classNames.bind(styles);

function UserManagement() {
    // Mock data
    const [users, setUsers] = useState([]);

    const fetchData = async () => {
        const res = await requestGetAllUser();
        setUsers(res.metadata);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingUser, setEditingUser] = useState(null);

    const showModal = (user = null) => {
        setEditingUser(user);
        if (user) {
            form.setFieldsValue({
                id: user._id,
                fullName: user.fullName,
                phone: `0${user.phone}`,
                email: user.email,
                isAdmin: user.isAdmin,
                status: user.status,
                isActive: user.isActive,
            });
            if (!user.id) {
                form.setFieldsValue({ password: '' });
            }
        } else {
            form.resetFields();
            form.setFieldsValue({
                status: 'active',
                isAdmin: false,
            });
        }
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleSubmit = () => {
        form.validateFields()
            .then(async (values) => {
                if (editingUser) {
                    console.log(values);

                    await requestUpdateUser(values);
                    await fetchData();
                    message.success('Người dùng đã được cập nhật!');
                }
                setIsModalOpen(false);
                form.resetFields();
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: '_id',
            key: '_id',
            width: 70,
        },
        {
            title: 'Người dùng',
            key: 'fullName',
            render: (_, record) => (
                <div className={cx('user-info')}>
                    <Avatar src={record.avatar} size={40} icon={<UserOutlined />} />
                    <div className={cx('user-details')}>
                        <div className={cx('user-name')}>{record.fullName}</div>
                        <div className={cx('user-email')}>{record.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            width: 150,
            render: (phone) => {
                if (phone) {
                    return `0${phone}`;
                }
                return '-';
            },
        },
        {
            title: 'Vai trò',
            dataIndex: 'isAdmin',
            key: 'isAdmin',
            width: 120,
            render: (isAdmin) => (
                <Tag color={isAdmin ? '#cf1322' : '#108ee9'} className={cx('role-tag')}>
                    {isAdmin ? 'Admin' : 'Người dùng'}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 150,
            render: (status) => (
                <Tag
                    color={status ? 'success' : 'error'}
                    icon={status ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    className={cx('status-tag')}
                >
                    {status ? 'Hoạt động' : 'Đã khóa'}
                </Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (createdAt) => dayjs(createdAt).format('DD/MM/YYYY'),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 180,
            render: (_, record) => (
                <Space size="small" className={cx('action-buttons')}>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => showModal(record)}
                            size="middle"
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const validatePhone = (_, value) => {
        const phoneRegex = /^0[0-9]{9}$/;
        if (!value || phoneRegex.test(value)) {
            return Promise.resolve();
        }
        return Promise.reject('Vui lòng nhập số điện thoại hợp lệ (10 số, bắt đầu bằng số 0)');
    };

    const validateEmail = (_, value) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!value || emailRegex.test(value)) {
            return Promise.resolve();
        }
        return Promise.reject('Vui lòng nhập địa chỉ email hợp lệ');
    };

    return (
        <div className={cx('user-management')}>
            <div className={cx('header')}>
                <div className={cx('title-section')}>
                    <h2>Quản lý người dùng</h2>
                    <p className={cx('subtitle')}>Quản lý tất cả tài khoản người dùng trong hệ thống</p>
                </div>
                {/* <div className={cx('actions')}>
                    <Search
                        placeholder="Tìm kiếm người dùng"
                        allowClear
                        onChange={(e) => handleSearch(e.target.value)}
                        className={cx('search-input')}
                    />
                </div> */}
            </div>

            <Card className={cx('table-card')}>
                <Table
                    dataSource={users}
                    columns={columns}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20'],
                        showTotal: (total) => `Tổng cộng ${total} người dùng`,
                    }}
                    className={cx('users-table')}
                    rowClassName={(record) => (record.status === 'blocked' ? cx('inactive-row') : '')}
                />
            </Card>

            <Modal
                title={
                    <div className={cx('modal-title')}>
                        <UserOutlined className={cx('modal-icon')} />
                        {editingUser ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}
                    </div>
                }
                open={isModalOpen}
                onCancel={handleCancel}
                onOk={handleSubmit}
                okText={editingUser ? 'Cập nhật' : 'Thêm mới'}
                cancelText="Hủy"
                className={cx('user-modal')}
            >
                <Form form={form} layout="vertical" name="user_form">
                    <Form.Item
                        name="id"
                        label="ID"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập họ tên!',
                            },
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Nhập họ tên" />
                    </Form.Item>
                    <Form.Item
                        name="fullName"
                        label="Họ tên"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập họ tên!',
                            },
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Nhập họ tên" />
                    </Form.Item>

                    <div className={cx('form-row')}>
                        <Form.Item
                            name="phone"
                            label="Số điện thoại"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập số điện thoại!',
                                },
                                { validator: validatePhone },
                            ]}
                            className={cx('phone-input')}
                        >
                            <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập email!',
                                },
                                { validator: validateEmail },
                            ]}
                            className={cx('email-input')}
                        >
                            <Input prefix={<MailOutlined />} placeholder="Nhập email" />
                        </Form.Item>
                    </div>

                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mật khẩu!',
                                },
                                {
                                    min: 6,
                                    message: 'Mật khẩu phải có ít nhất 6 ký tự!',
                                },
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
                        </Form.Item>
                    )}

                    <div className={cx('form-row')}>
                        <Form.Item name="isAdmin" label="Vai trò" initialValue={false} className={cx('role-input')}>
                            <Switch
                                checkedChildren="Admin"
                                unCheckedChildren="Người dùng"
                                className={cx('role-switch')}
                            />
                        </Form.Item>

                        <Form.Item
                            name="isActive"
                            label="Trạng thái"
                            initialValue="active"
                            className={cx('status-input')}
                        >
                            <Switch
                                checkedChildren="Hoạt động"
                                unCheckedChildren="Đã khóa"
                                defaultChecked
                                className={cx('status-switch')}
                            />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}

export default UserManagement;
