import React from 'react'

const Welcome = () => {
  return (
    <div>
        <div className="text-left py-40 bg-cover bg-center" style={{ backgroundImage: "url(/src/assets/image/petbackground.jpg)" }}>
        <div className="container mx-auto">
          <div className="text-center inline-block bg-cyan-400 p-40 rounded-lg shadow-md opacity-80">
            <h6 className="text-4xl">Welcome to <i>Pet Service</i></h6>
            <div id="typed-strings" className="text-lg italic">
              <p className='text-white'>Happy for pets is happy for you.</p>
            </div>
            <span id="typed" className="text-lg italic" style={{ whiteSpace: "pre" }}></span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Welcome