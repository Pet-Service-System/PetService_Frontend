

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="py-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-4">
                <h2 className="text-3xl md:text-4xl font-semibold">
                  Pet Service
                </h2>
              </div>
              <p className="text-base md:text-lg lg:text-xl">
                Pet Service ra đời với mong muốn mang lại cho khách hàng sự chuyên nghiệp, uy tín mang nét đẹp hoa mỹ mà chúng tôi đem lại sự trải nghiệm tốt nhất cho thú cưng của chúng ta. Với nhiều năm kinh nghiệm trong ngành dịch vụ thú cưng bao gồm: Spa thú cưng, Khách sạn thú cưng, Dịch vụ thú cưng tại nhà,…
              </p>
              <p className="text-base md:text-lg lg:text-xl">Contact us : (+00) 123 234</p>
              <p className="text-base md:text-lg lg:text-xl">Email: petservicesswp391@gmail.com</p>
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-4">Địa chỉ</h3>
              <ul className="space-y-2">
                <li className="text-base md:text-lg lg:text-xl">Chi nhánh 1: 217 Lâm Văn Bền, Phường Bình Thuận, Quận 7, TPHCM</li>
                <li className="text-base md:text-lg lg:text-xl">Chi nhánh 2: 168 Thượng Đình, Thanh Xuân, Hà Nội</li>
                <li className="text-base md:text-lg lg:text-xl">Chi nhánh 3: 627 Ngô Quyền, An Hải Bắc, Sơn Trà, TP. Đà Nẵng</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-900 py-4">
        <div className="container mx-auto text-center">
          <p className="text-sm md:text-base lg:text-lg">© 2017 Pet Service. All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;