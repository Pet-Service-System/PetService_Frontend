import React from 'react';

const Welcome = () => {
  return (
    <div className="bg-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex justify-center">
            <div className="w-full">
              <img src="/src/assets/image/Team.jpg" alt=" " className="w-full h-auto" />
            </div>
          </div>
          <div>
            <div className="ml-4 px-20 text-justify">
              <h3 className="text-6xl font-semibold mb-4 text-red-500">Giới thiệu</h3>
              <h1 className="text-3xl font-extralight py-10">PET SERVICE ra đời với mong muốn mang lại cho khách hàng sự chuyên nghiệp, uy tín mang nét đẹp hoa mỹ mà chúng tôi đem lại sự trải nghiệm tốt nhất cho thú cưng của chúng ta. Với hơn 5 năm kinh nghiệm trong ngành dịch vụ thú cưng bao gồm: Thú y, Spa thú cưng, Khách sạn thú cưng, Cung cấp các dòng thú cưng chuyên nghiệp...</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
