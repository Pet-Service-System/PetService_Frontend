import React from 'react';

const Welcome = () => {
  return (
    <div className="sm:flex items-center max-w-screen-xl pl-20">
      <div className="sm:w-1/2 p-10">
        <div className="image object-center text-center">
          <img src="/src/assets/image/Team.jpg" alt=" " />
        </div>
      </div>
      <div className="sm:w-1/2 p-5">
        <div className="text">
          <span className="text-gray-500 border-b-2 border-indigo-600 uppercase">About us</span>
          <h2 className="my-4 font-bold text-3xl  sm:text-4xl ">About <span className="my-4 font-bold text-3xl  sm:text-4xl ">Our Pet Service</span>
          </h2>
          <p className="text-gray-700 pl-10">
            PET SERVICE ra đời với mong muốn mang lại cho khách hàng sự chuyên nghiệp, uy tín mang nét đẹp hoa mỹ mà chúng tôi đem lại sự trải nghiệm tốt nhất cho thú cưng của chúng ta. Với hơn 5 năm kinh nghiệm trong ngành dịch vụ thú cưng bao gồm: Thú y, Spa thú cưng, Khách sạn thú cưng, Cung cấp các dòng thú cưng chuyên nghiệp..
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
