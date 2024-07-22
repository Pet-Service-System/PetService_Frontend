
import { FloatButton } from 'antd';
import About from '../components/HomePage/About';
import Statistics from '../components/HomePage/Statistics';
import Welcome from '../components/HomePage/Welcome';
import { FacebookOutlined } from '@ant-design/icons';

const HomePage = () => {
  return (
    <div >
        <Welcome />
        <About/>
        <Statistics/>
        <div className="fixed bottom-5 right-5 z-50">
          <FloatButton
            type="primary"
            shape="circle"
            icon={<FacebookOutlined className='w-20 h-20'/>}
            href="https://www.facebook.com/profile.php?id=61563334526011"
            target="_blank"
            className="bg-blue-500 hover:bg-blue-600 w-24 h-24 flex items-center justify-center"
          />
        </div>
    </div>
  );
}

export default HomePage;
