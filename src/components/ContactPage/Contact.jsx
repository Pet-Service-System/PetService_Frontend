import React from 'react';
import { FaHouseChimney } from "react-icons/fa6";
import { IoMdMail } from "react-icons/io";
import { FaPhoneAlt } from "react-icons/fa";


const Contact = () => {
  return (
    <div className="bg-gray-100 py-12 px-40">
      <div className="container mx-auto px-4">
        <h3 className="text-6xl text-red-500 text-center font-semibold mb-8">Liên hệ</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="address-row flex items-center">
            <FaHouseChimney className='icon w-20 h-20'/>
            <div className="address-right">
              <h5 className="font-semibold">Visit Us</h5>
              <p>Pet Service Quận 7</p>
            </div>
          </div>
          <div className="address-row flex items-center">
            <IoMdMail className='icon w-20 h-20'/>
            <div className="address-right">
              <h5 className="font-semibold">Mail Us</h5>
              <p><a href="mailto:info@example.com"> petservicemanagement@gmail.com</a></p>
            </div>
          </div>
          <div className="address-row flex items-center">
            <FaPhoneAlt className='icon w-20 h-20'/>
            <div className="address-right">
              <h5 className="font-semibold">Call Us</h5>
              <p>(+00) 123 234</p>
            </div>
          </div>
        </div>
        <form className="mt-8" action="#" method="post">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="contact-left">
              <input className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 mb-3" type="text" name="Name" placeholder="Your Name" required=""/>
              <input className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 mb-3" type="email" name="Email" placeholder="Email" required=""/>
              <input className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 mb-3" type="text" name="Mobile Number" placeholder="Mobile Number" required=""/>
            </div>
            <div className="contact-right">
              <textarea className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 mb-3" name="Message" placeholder="Message" required=""></textarea>
              <input className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-600" type="submit" value="Submit" />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Contact;
