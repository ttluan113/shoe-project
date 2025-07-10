import React, { useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import {
    Table,
    Card,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Upload,
    Space,
    Tag,
    message,
    Image,
    Tooltip,
    Tabs,
    Divider,
    Badge,
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    PictureOutlined,
    EyeOutlined,
    SearchOutlined,
    ShoppingOutlined,
    InfoCircleOutlined,
} from '@ant-design/icons';
import classNames from 'classnames/bind';
import styles from './ProductManagement.module.scss';
import {
    requestCreateProduct,
    requestDeleteProduct,
    requestGetAllProductAdmin,
    requestUpdateProduct,
} from '../../../../config/request';

import { useStore } from '../../../../hooks/useStore';

const cx = classNames.bind(styles);
const { Option } = Select;
const { TabPane } = Tabs;

function ProductManagement() {
    // Mock data
    const [products, setProducts] = useState([]);

    const { dataCategory } = useStore();

    console.log(dataCategory);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingProduct, setEditingProduct] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [previewVisible, setPreviewVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('1');
    const [description, setDescription] = useState('');

    const fetchData = async () => {
        const res = await requestGetAllProductAdmin();
        setProducts(res.metadata);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const showModal = (product = null) => {
        setActiveTab('1');
        setEditingProduct(product);
        if (product) {
            // Cập nhật giá trị mô tả
            setDescription(product.description);

            form.setFieldsValue({
                nameProduct: product.nameProduct,
                price: product.price,
                description: product.description,
                categoryId: product.categoryId,
                status: product.status,
                fileList: product.images.map((img, index) => ({
                    uid: `-${index}`,
                    name: `image-${index}.png`,
                    status: 'done',
                    url: `http://localhost:3000/uploads/images/${img}`,
                })),
                sizes: product.size.map((item) => ({
                    size: item.size,
                    quantity: item.quantity,
                })),
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
                if (editingProduct) {
                    // Update existing product
                    const updatedProduct = {
                        nameProduct: values.nameProduct,
                        price: values.price,
                        description: description,
                        categoryId: values.categoryId,
                        status: values.status,
                        size: values.sizes || [],
                    };

                    const formData = new FormData();
                    formData.append('id', editingProduct._id);
                    formData.append('nameProduct', updatedProduct.nameProduct);
                    formData.append('price', updatedProduct.price);
                    formData.append('description', updatedProduct.description);
                    formData.append('categoryId', updatedProduct.categoryId);
                    formData.append('status', updatedProduct.status);

                    // Convert size array to JSON string
                    formData.append('size', JSON.stringify(updatedProduct.size));

                    const data = {
                        id: editingProduct._id,
                        nameProduct: values.nameProduct,
                        price: values.price,
                        description: description,
                        categoryId: values.categoryId,
                        status: values.status,
                        size: values.sizes || [],
                    };

                    // Gọi API cập nhật
                    await requestUpdateProduct(data);

                    // Cập nhật danh sách hiển thị
                    fetchData();

                    message.success('Sản phẩm đã được cập nhật!');
                } else {
                    // Add new product
                    const newProduct = {
                        id: Date.now().toString(),
                        nameProduct: values.nameProduct,
                        price: values.price,
                        description: description,
                        categoryId: values.categoryId,
                        status: values.status || true,
                        images: values.fileList.map((file) => file.originFileObj),
                        size: values.sizes || [],
                        soldCount: 0,
                    };

                    const formData = new FormData();
                    formData.append('nameProduct', newProduct.nameProduct);
                    formData.append('price', newProduct.price);
                    formData.append('description', newProduct.description);
                    formData.append('categoryId', newProduct.categoryId);
                    formData.append('status', newProduct.status);

                    // Append each image file individually
                    newProduct.images.forEach((image) => {
                        formData.append('images', image);
                    });

                    // Convert size array to JSON string
                    formData.append('size', JSON.stringify(newProduct.size));
                    formData.append('stock', newProduct.soldCount);

                    // Uncomment the API call
                    await requestCreateProduct(formData);
                    await fetchData();
                    message.success('Sản phẩm đã được thêm mới!');
                }
                setIsModalOpen(false);
                form.resetFields();
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
            content: 'Hành động này không thể hoàn tác.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            async onOk() {
                const data = {
                    idProduct: id,
                };

                await requestDeleteProduct(data);
                fetchData();
                message.success('Sản phẩm đã được xóa!');
            },
        });
    };

    const getTotalStock = (product) => {
        return product.size.reduce((total, item) => total + item.quantity, 0);
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: '_id',
            key: '_id',
            width: 70,
        },
        {
            title: 'Ảnh',
            dataIndex: 'images',
            key: 'images',
            width: 100,
            render: (images) => (
                <div className={cx('product-image')}>
                    {images && images.length > 0 ? (
                        <Image
                            src={`http://localhost:3000/uploads/images/${images[0]}`}
                            alt="Product"
                            width={60}
                            height={60}
                            style={{ objectFit: 'cover' }}
                            preview={false}
                        />
                    ) : (
                        <PictureOutlined style={{ fontSize: '24px' }} />
                    )}
                </div>
            ),
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'nameProduct',
            key: 'nameProduct',
            render: (text, record) => (
                <div className={cx('product-name')}>
                    <span className={cx('name')}>{text}</span>
                </div>
            ),
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => <span className={cx('price')}>{price.toLocaleString('vi-VN')}đ</span>,
        },
        {
            title: 'Danh mục',
            dataIndex: 'categoryId',
            key: 'categoryId',
            render: (categoryId) => {
                const category = dataCategory.find((c) => c._id === categoryId);
                return category ? (
                    <Tag color="#108ee9" className={cx('category-tag')}>
                        {category.nameCategory}
                    </Tag>
                ) : (
                    'N/A'
                );
            },
        },
        {
            title: 'Tồn kho',
            key: 'stock',
            render: (_, record) => {
                const totalStock = getTotalStock(record);
                let color = totalStock > 30 ? '#52c41a' : totalStock > 10 ? '#faad14' : '#f5222d';

                return (
                    <Tag color={color} className={cx('stock-tag')}>
                        {totalStock} đôi
                    </Tag>
                );
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Badge
                    status={status ? 'success' : 'error'}
                    text={status ? 'Hiển thị' : 'Ẩn'}
                    className={cx('status-badge')}
                />
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 180,
            render: (_, record) => (
                <Space size="small" className={cx('action-buttons')}>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            ghost
                            onClick={() => showModal(record)}
                            size="middle"
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => showModal(record)}
                            size="middle"
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record._id)}
                            size="middle"
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const handlePreview = (file) => {
        setPreviewImage(file.preview || file.url || URL.createObjectURL(file.originFileObj));
        setPreviewVisible(true);
    };

    return (
        <div className={cx('product-management')}>
            <div className={cx('header')}>
                <div className={cx('title-section')}>
                    <h2>Quản lý sản phẩm</h2>
                    <p className={cx('subtitle')}>Quản lý tất cả sản phẩm trong cửa hàng</p>
                </div>
                <div className={cx('actions')}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showModal()}
                        className={cx('add-button')}
                    >
                        Thêm sản phẩm mới
                    </Button>
                </div>
            </div>

            <Card className={cx('table-card')}>
                <Table
                    dataSource={products}
                    columns={columns}
                    rowKey="id"
                    pagination={{
                        pageSize: 5,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20'],
                        showTotal: (total) => `Tổng cộng ${total} sản phẩm`,
                    }}
                    className={cx('products-table')}
                    rowClassName={(record) => (!record.status ? cx('inactive-row') : '')}
                />
            </Card>

            <Modal
                title={
                    <div className={cx('modal-title')}>
                        <ShoppingOutlined className={cx('modal-icon')} />
                        {editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                    </div>
                }
                open={isModalOpen}
                onCancel={handleCancel}
                onOk={handleSubmit}
                okText={editingProduct ? 'Cập nhật' : 'Thêm mới'}
                cancelText="Hủy"
                width={800}
                className={cx('product-modal')}
            >
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="Thông tin cơ bản" key="1">
                        <Form form={form} layout="vertical" name="product_form">
                            <Form.Item
                                name="nameProduct"
                                label="Tên sản phẩm"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập tên sản phẩm!',
                                    },
                                ]}
                            >
                                <Input
                                    placeholder="Nhập tên sản phẩm"
                                    suffix={
                                        <Tooltip title="Tên hiển thị của sản phẩm">
                                            <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                                        </Tooltip>
                                    }
                                />
                            </Form.Item>

                            <div className={cx('form-row')}>
                                <Form.Item
                                    name="price"
                                    label="Giá"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập giá sản phẩm!',
                                        },
                                    ]}
                                    className={cx('price-input')}
                                >
                                    <InputNumber
                                        min={0}
                                        style={{ width: '100%' }}
                                        formatter={(value) => `${value} đ`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value.replace(/\s?đ\s?|(,*)/g, '')}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="categoryId"
                                    label="Danh mục"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng chọn danh mục!',
                                        },
                                    ]}
                                    className={cx('category-input')}
                                >
                                    <Select placeholder="Chọn danh mục">
                                        {dataCategory.map((category) => (
                                            <Option key={category._id} value={category._id}>
                                                {category.nameCategory}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </div>

                            <Form.Item
                                name="description"
                                label="Mô tả"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập mô tả sản phẩm!',
                                    },
                                ]}
                            >
                                <Editor
                                    apiKey="ynym4wcm9wfhg6x1w7o6zj8rbtskedj12vtqhgf7vape8jpw"
                                    init={{
                                        plugins:
                                            'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                                        toolbar:
                                            'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                                    }}
                                    onEditorChange={(content, editor) => {
                                        setDescription(content);
                                    }}
                                    value={description}
                                />
                            </Form.Item>

                            <Divider orientation="left">Trạng thái</Divider>
                            <Form.Item name="status" valuePropName="checked" initialValue={true} defaultValue={true}>
                                <Select>
                                    <Option value={true}>Hiển thị</Option>
                                    <Option value={false}>Ẩn</Option>
                                </Select>
                            </Form.Item>

                            <div className={cx('tab-actions')}>
                                <Button type="primary" onClick={() => setActiveTab('2')}>
                                    Tiếp theo: Hình ảnh & Kích cỡ
                                </Button>
                            </div>
                        </Form>
                    </TabPane>
                    <TabPane tab={editingProduct ? 'Kích cỡ' : 'Hình ảnh & Kích cỡ'} key="2">
                        <Form form={form} layout="vertical">
                            {!editingProduct && (
                                <Form.Item
                                    name="fileList"
                                    label={
                                        <div className={cx('upload-label')}>
                                            <span>Hình ảnh sản phẩm</span>
                                            <span className={cx('upload-hint')}>(Tải lên tối đa 5 hình ảnh)</span>
                                        </div>
                                    }
                                    valuePropName="fileList"
                                    getValueFromEvent={normFile}
                                    className={cx('upload-container')}
                                >
                                    <Upload
                                        listType="picture-card"
                                        beforeUpload={() => false}
                                        onPreview={handlePreview}
                                        className={cx('product-upload')}
                                        maxCount={5}
                                    >
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Tải lên</div>
                                        </div>
                                    </Upload>
                                </Form.Item>
                            )}
                            {editingProduct && <div></div>}

                            <Divider orientation="left">
                                <div className={cx('sizes-header')}>
                                    <span>Kích cỡ và số lượng</span>
                                    <span className={cx('sizes-hint')}>
                                        (Thêm các kích cỡ và số lượng của sản phẩm)
                                    </span>
                                </div>
                            </Divider>

                            <Form.List name="sizes">
                                {(fields, { add, remove }) => (
                                    <>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -8px' }}>
                                            {fields.map(({ key, name, ...restField }) => (
                                                <div
                                                    key={key}
                                                    style={{ width: '33.33%', padding: '0 8px', marginBottom: '16px' }}
                                                >
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'size']}
                                                            rules={[{ required: true, message: 'Nhập kích cỡ' }]}
                                                            style={{ flex: 1, marginBottom: 0 }}
                                                        >
                                                            <Input placeholder="Kích cỡ (VD: 39, 40, 41...)" />
                                                        </Form.Item>
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'quantity']}
                                                            rules={[{ required: true, message: 'Nhập số lượng' }]}
                                                            style={{ width: '80px', marginBottom: 0 }}
                                                        >
                                                            <InputNumber
                                                                placeholder="Số lượng"
                                                                min={0}
                                                                style={{ width: '100%' }}
                                                            />
                                                        </Form.Item>
                                                        <Button
                                                            danger
                                                            onClick={() => remove(name)}
                                                            icon={<DeleteOutlined />}
                                                            style={{ padding: '4px', height: '32px', width: '32px' }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Form.Item>
                                            <Button
                                                type="dashed"
                                                onClick={() => add()}
                                                block
                                                icon={<PlusOutlined />}
                                                className={cx('add-size-button')}
                                            >
                                                Thêm kích cỡ
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        </Form>
                    </TabPane>
                </Tabs>
            </Modal>

            <Modal
                open={previewVisible}
                title="Xem trước hình ảnh"
                footer={null}
                onCancel={() => setPreviewVisible(false)}
            >
                <img alt="Preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </div>
    );
}

export default ProductManagement;
