
import About from '../components/HomePage/About';
import Banner from '../components/HomePage/Banner';
import Footer from '../components/HomePage/Footer';
import Welcome from '../components/HomePage/Welcome';

const HomePage = () => {
  return (
    <div >
        <Banner />
        <Welcome />
        <About/>
        <Footer />
    </div>
  );
}

export default HomePage;
