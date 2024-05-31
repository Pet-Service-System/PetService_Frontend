
import Banner from '../components/homePage/Banner';
import Footer from '../components/homePage/Footer';
import Welcome from '../components/homePage/Welcome';

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
