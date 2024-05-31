
import Banner from '../components/UserProfilePage/Banner'
import Footer from '../components/homePage/Footer'
import TransactionDetail from '../components/TransactionDetailPage/TransactionDetail'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getTransactionDetail } from '../apis/ApiTransaction';

const TransactionDetailPage = () => {
  const {id} = useParams();
  const [transactionData, setTransactionData] = useState();
    useEffect(()=>{
      getTransactionDetail(id).then((data)=>{
        setTransactionData(data)
      })
  },[])
  return (transactionData &&
    <div>
        <Banner/>
        <TransactionDetail transactionData={transactionData}/>
        <Footer/>
    </div>
  )
}

export default TransactionDetailPage