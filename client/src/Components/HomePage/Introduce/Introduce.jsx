import classNames from 'classnames/bind';
import styles from './Introduce.module.scss';

import img from '../../../assets/images/Logo.png';

const cx = classNames.bind(styles);

function Introduce() {
    return (
        <div className={cx('wrapper')}>
            <img src={img} alt="" />
            <div>
                <h1>VỀ CHÚNG TÔI</h1>
                <p>
                    Ra đời với sứ mệnh đưa phong cách thể thao hiện đại đến gần hơn với phái mạnh, KingShoes tự hào là
                    điểm đến hàng đầu cho giới yêu giày tại Việt Nam. Không chỉ đơn thuần là một cửa hàng, KingShoes là
                    nơi hội tụ của đam mê, chất lượng và công nghệ – mang đến những đôi giày chạy bộ, bóng rổ,
                    pickleball và sneaker từ các thương hiệu uy tín trong và ngoài nước. KingShoes không ngừng cập nhật
                    những xu hướng công nghệ mới nhất trong ngành giày thể thao, từ đệm khí êm ái, đế foam siêu nhẹ đến
                    vật liệu thân thiện với môi trường. Mỗi sản phẩm tại đây đều được chọn lọc kỹ lưỡng, phù hợp với nhu
                    cầu vận động cao, đồng thời đảm bảo tính thẩm mỹ để bạn có thể tự tin từ sân tập đến phố phường.
                </p>
            </div>
        </div>
    );
}

export default Introduce;
