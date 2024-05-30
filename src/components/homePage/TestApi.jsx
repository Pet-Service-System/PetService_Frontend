import axios from 'axios'
import React, { useEffect, useState } from 'react'

const TestApi = () => {
    const [list,setList]=useState([]);
    const [name,setName]=useState("");
    const [price,setPrice]=useState(0);
    const data={
        name:name,
        price:price
    }
    const handleSubmit=()=>{
        const res= axios.post("https://65369b10bb226bb85dd267ab.mockapi.io/ticket/film",data);
        res.then((data)=>{
          console.log(data);
        }).catch((e)=>console.log(e.error))
    }
        

    console.log(list);
  return (
    <div>
       <input aria-label='input name' onChange={(e)=>setName(e.target.value)}></input>
       <input aria-label='input price' type="number" onChange={(e)=>setPrice(e.target.value)}></input>
      
       <button onClick={handleSubmit}>bam di</button>
    </div>
  )
}

export default TestApi