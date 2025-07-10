import classNames from 'classnames/bind';
import styles from './Register.module.scss';
import Header from '../../Components/Header/Header';
import { requestRegister } from '../../config/request';
import { useEffect } from 'react';

import { message } from 'antd';

import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const cx = classNames.bind(styles);

function RegisterUser() {
    const [fullname, setFullname] = useState(''); // Tạo state để lưu fullname
    const [email, setEmail] = useState(''); // Tạo state để lưu email
    const [phone, setPhone] = useState(''); // Tạo state để lưu phone
    const [password, setPassword] = useState(''); // Tạo state để lưu password
    const [confirmPassword, setConfirmPassword] = useState(''); // Tạo state để lưu confirmPassword

    const navigate = useNavigate();

    const handleRegister = async () => {
        // Hàm xử lý đăng ký
        try {
            // Thực hiện đăng ký
            var pattern = /[A-Z]/; // Kiểm tra xem chuỗi có chứa ký tự viết hoa hay không
            const checkEmail = pattern.test(email);

            if (fullname === '' || email === '' || password === '' || confirmPassword === '') {
                // Kiểm tra xem fullname, email, password, confirmPassword
                message.error('Vui Lòng Xem Lại Thông Tin !!!'); // Hàm toast.error hiển thị thông báo lỗi
            } else if (checkEmail === true) {
                // Kiểm tra xem email
                message.error('Email Không Được Viết Hoa !!!'); // Hàm toast.error hiển thị thông báo lỗi
            } else if (password !== confirmPassword) {
                // Kiểm tra xem password, confirmPassword
                message.error('Mật Khẩu Không Trùng Khớp !!!'); // Hàm toast.error hiển thị thông báo lỗi
            } else {
                // Nếu đăng ký thành công
                const data = {
                    fullName: fullname,
                    email,
                    password,
                    phone: Number(phone),
                };
                const res = await requestRegister(data);
                message.success(res.message); // Hiển thị thông báo thành công
                setTimeout(() => {
                    window.location.reload();
                }, 2000);

                navigate('/');
            }
        } catch (error) {
            // Nếu đăng ký thất bại
            message.error(error.response.data.message); // Hiển thị thông báo lỗi
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <div className={cx('body-wrapper')}>
                <header>
                    <Header />
                </header>
                <div className={cx('wrapper')}>
                    <div className={cx('inner')}>
                        <div className={cx('header-form-login')}>
                            <span>Đăng ký</span>
                            <p>Đăng ký thành viên để nhận nhiều ưu đãi</p>
                        </div>
                        <div className={cx('input-box')}>
                            <div className={cx('form-input')}>
                                <label>Họ và tên</label>
                                <input placeholder="Nhập họ và tên" onChange={(e) => setFullname(e.target.value)} />
                            </div>

                            <div className={cx('form-input')}>
                                <label>Email</label>
                                <input placeholder="Nhập email" onChange={(e) => setEmail(e.target.value)} />
                            </div>

                            <div className={cx('form-input')}>
                                <label>Số điện thoại</label>
                                <input
                                    placeholder="Nhập số điện thoại liên hệ"
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>

                            <div className={cx('form-input')}>
                                <label>Mật khẩu</label>

                                <input
                                    placeholder="Nhập mật khẩu"
                                    type="password"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className={cx('form-input')}>
                                <label>Nhập lại mật khẩu</label>
                                <input
                                    type="password"
                                    placeholder="Nhập lại mật khẩu"
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <button className={cx('btn-login')} onClick={handleRegister}>
                            Đăng ký
                        </button>
                        <div className={cx('login-footer')}>
                            <p>
                                Đã có tài khoản ?{' '}
                                <Link id={cx('link')} to="/login">
                                    Đăng nhập
                                </Link>{' '}
                                ngay
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default RegisterUser;
