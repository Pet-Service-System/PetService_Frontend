import ProductDetail from '../components/ProductDetailPage/ProductDetail'
import Banner from '../components/HomePage/Banner'
import Footer from '../components/HomePage/Footer'

const ForCatProductDetailPage = () => {
  return (
    <div>
        <Banner/>
        <ProductDetail type='cat'/>
        <Footer/>
    </div>
  )
}

export default ForCatProductDetailPage