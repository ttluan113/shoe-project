import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Modal, Form, Input, message, Space, Tag, Input as AntInput, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, InfoCircleOutlined, AppstoreOutlined } from '@ant-design/icons';
import classNames from 'classnames/bind';
import styles from './CategoryManagement.module.scss';

import dayjs from 'dayjs';

import { useStore } from '../../../../hooks/useStore';
import { requestAddCategory, requestDeleteCategory, requestUpdateCategory } from '../../../../config/request';

const cx = classNames.bind(styles);
const { Search } = AntInput;

function CategoryManagement() {
    const { dataCategory, getCategory } = useStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchText, setSearchText] = useState('');

    const showModal = (category = null) => {
        setEditingCategory(category);
        if (category) {
            form.setFieldsValue({
                nameCategory: category.nameCategory,
            });
        } else {
            form.resetFields();
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
                if (editingCategory) {
                    const data = {
                        _id: editingCategory._id,
                        nameCategory: values.nameCategory,
                    };
                    await requestUpdateCategory(data);
                    await getCategory();
                    message.success('Danh mục đã được cập nhật!');
                } else {
                    // Add new category
                    const data = {
                        nameCategory: values.nameCategory,
                    };
                    await requestAddCategory(data);
                    await getCategory();
                    message.success('Danh mục đã được thêm mới!');
                }
                setIsModalOpen(false);
                form.resetFields();
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Bạn có chắc chắn muốn xóa danh mục này?',
            content: 'Hành động này không thể hoàn tác.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            async onOk() {
                const data = {
                    categoryId: id,
                };
                await requestDeleteCategory(data);
                await getCategory();
                message.success('Danh mục đã được xóa!');
            },
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
            title: 'Tên danh mục',
            dataIndex: 'nameCategory',
            key: 'nameCategory',
            render: (text, record) => (
                <div className={cx('category-name')}>
                    <AppstoreOutlined className={cx('category-icon')} />
                    {text}
                </div>
            ),
        },
        {
            title: 'Số sản phẩm',
            dataIndex: 'productCount',
            key: 'productCount',
            width: 120,
            render: (count) => (
                <Tag color="#108ee9" className={cx('count-tag')}>
                    {count} sản phẩm
                </Tag>
            ),
        },

        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (text) => dayjs(text).format('DD/MM/YYYY'),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                <Space size="middle" className={cx('action-buttons')}>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)} size="middle">
                            Sửa
                        </Button>
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)} size="middle">
                            Xóa
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className={cx('category-management')}>
            <div className={cx('header')}>
                <div className={cx('title-section')}>
                    <h2>Quản lý danh mục</h2>
                    <p className={cx('subtitle')}>Quản lý tất cả danh mục sản phẩm trong cửa hàng</p>
                </div>
                <div className={cx('actions')}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showModal()}
                        className={cx('add-button')}
                    >
                        Thêm danh mục
                    </Button>
                </div>
            </div>

            <Card className={cx('table-card')}>
                <Table
                    dataSource={dataCategory}
                    columns={columns}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20'],
                        showTotal: (total) => `Tổng cộng ${total} danh mục`,
                    }}
                    className={cx('categories-table')}
                    rowClassName={(record) => (record.status === 'inactive' ? cx('inactive-row') : '')}
                />
            </Card>

            <Modal
                title={
                    <div className={cx('modal-title')}>
                        <AppstoreOutlined className={cx('modal-icon')} />
                        {editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
                    </div>
                }
                open={isModalOpen}
                onCancel={handleCancel}
                onOk={handleSubmit}
                okText={editingCategory ? 'Cập nhật' : 'Thêm mới'}
                cancelText="Hủy"
                className={cx('category-modal')}
            >
                <Form form={form} layout="vertical" name="category_form">
                    <Form.Item
                        name="nameCategory"
                        label="Tên danh mục"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập tên danh mục!',
                            },
                        ]}
                    >
                        <Input
                            placeholder="Nhập tên danh mục"
                            suffix={
                                <Tooltip title="Tên danh mục hiển thị trên giao diện người dùng">
                                    <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                                </Tooltip>
                            }
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default CategoryManagement;
