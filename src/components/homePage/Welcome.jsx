import React from 'react'

const Welcome = () => {
  return (
    <div>
      <div className="text-left py-40 bg-cover bg-center" style={{ backgroundImage: "url(/src/assets/image/petbackground.jpg)" }}>
        {/* <div className="container mx-auto">
      <div className="text-center inline-block bg-cyan-400 p-40 rounded-lg shadow-md opacity-100 ">
        <h6 className="text-4xl">Welcome to <i>Pet Service</i></h6>
        <div id="typed-strings" className="text-lg italic">
          <p className='text-white text-3xl font-bold mt-4  text-center'>Happy for pets is happy for you.</p>
        </div>
        <span id="typed" className="text-lg italic" style={{ whiteSpace: "pre" }}></span>
      </div>
    </div> */}
        <section className="py-8 z-10 font-serif">
          <div className="flex flex-col md:flex-row items-start max-w-6xl px-0 py-8 mx-auto">
            <div className="w-full md:w-1/2 py-8 text-left">
              <h1 className="text-purple-600 text-7xl font-semibold leading-none tracking-tighter">
                Welcome to
                <span className="text-blue-500"> Pet Service,
                </span> Happy for pets is happy for you.
              </h1>
            </div>
          </div>
        </section>
      </div>
    </div>

  )
}

export default Welcome