import React from "react";
import { NavLink } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="bg-white dark:bg-gray-800 flex justify-center items-center w-screen h-screen p-5">
            <div className="border shadow-teal-300 shadow-md max-w-2xl p-6 rounded-lg dark:bg-gray-700 dark:text-gray-300 hover:border-3">
                <h2 className="text-4xl font-mono font-extrabold py-3 text-center text-white">404 Not Found</h2>
                <div className="flex justify-center mt-1">
                    <img src="/src/assets/image/iconPet.png" alt="Pet Service Logo" className="my-2" /></div>
                <p className="text-center order shadow-teal-300 shadow-md max-w-2xl p-6 rounded-lg dark:bg-gray-700 dark:text-gray-300 hover:border-3 hover:text-white hover:bg-blue-600">
                    <NavLink className="text-white hover:text-red-500 font-bold text-5xl" to={"/"}>Back to Home</NavLink>

                </p>

            </div>
        </div>
    )
}

export default NotFound