
const Welcome = () => {
  return (
    <div>
      <div className="text-left py-40 bg-cover bg-center" style={{ backgroundImage: "url(/src/assets/image/petbackground.jpg)" }}>
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