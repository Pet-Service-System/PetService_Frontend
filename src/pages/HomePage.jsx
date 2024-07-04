
import About from '../components/HomePage/About';
import Banner from '../components/HomePage/Banner';
import Footer from '../components/HomePage/Footer';
import Statistics from '../components/HomePage/Statistics';
import Welcome from '../components/HomePage/Welcome';

const HomePage = () => {
  return (
    <div >
        <Banner />
        <Welcome />
        <About/>
        <Statistics/>
        <Footer />
    </div>
  );
}

export default HomePage;
