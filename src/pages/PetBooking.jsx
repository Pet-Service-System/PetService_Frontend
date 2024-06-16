import Banner from '../components/HomePage/Banner';
import Footer from '../components/HomePage/Footer';
import React from 'react';
import BookingForPet from '../components/PetBooking/BookingForPet';

const PetBooking = () => {
    return (
        <div>
            <Banner />
            <BookingForPet />
            <Footer />
        </div>
    )
}

export default PetBooking