
import Banner from '../components/HomePage/Banner';
import Footer from '../components/HomePage/Footer';
import Welcome from '../components/HomePage/Welcome';

const HomePage = () => {
  return (
    <div className='min-h-screen flex flex-col'>
        <Banner />
        <div className='flex-grow'>
          <Welcome />
        </div>
        <Footer />
    </div>
  );
}

export default HomePage;
