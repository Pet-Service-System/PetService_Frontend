import React from "react";

const NotFound = () => {
    return (
        <div>
            <section className="flex items-center h-screen p-16 bg-gray-50 dark:bg-gray-700">
                <div className="container flex flex-col items-center justify-center">
                    <div className="flex flex-col gap-6 max-w-md text-center">
                        <h2 className="font-extrabold text-9xl text-gray-600 dark:text-gray-100">
                            <span className="sr-only">Error</span>404
                        </h2>
                        <p className="text-2xl md:text-3xl dark:text-gray-300">Sorry, we couldn't find this page.</p>
                        <div className="flex justify-center">
                            <a href="/" className="text-left group p-5 cursor-pointer relative text-xl font-normal border-0 flex items-center justify-center bg-transparent text-red-500 h-auto w-[170px] overflow-hidden transition-all duration-100">
                                <span className="group-hover:w-full absolute left-0 h-full w-5 border-y border-l border-red-500 transition-all duration-500"></span>
                                <p className="group-hover:opacity-0 group-hover:translate-x-[-100%] absolute translate-x-0 transition-all duration-200">Back to home</p>
                                <span className="group-hover:translate-x-0 group-hover:opacity-100 absolute translate-x-full opacity-0 transition-all duration-200">Pet Service</span>
                                <span className="group-hover:w-full absolute right-0 h-full w-5 border-y border-r border-red-500 transition-all duration-500"></span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default NotFound;
