import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'tailwindcss/tailwind.css';
import { getPetInformation } from '../../apis/ApiPet';

const PetList = () => {
    const navigate = useNavigate();
    const [pets, setPets] = useState([]);
    const [isAddMode, setIsAddMode] = useState(false);
    const [editPetId, setEditPetId] = useState(null);
    const [newPetData, setNewPetData] = useState({ name: '', species: '', gender: '' });
    const [editPetData, setEditPetData] = useState({ id: '', name: '', species: '', gender: '' });
    const [errors, setErrors] = useState({ name: '', species: '', gender: '' });
    const genders = ['Đực', 'Cái'];
    
    useEffect(() => {
        getPetInformation().then((data) => {
            setPets(data);
        });
    }, []);

    const handleUpdatePet = (pet) => {
        setEditPetId(pet.id);
        setEditPetData(pet);
        setErrors({ name: '', species: '', gender: '' });
    };

    const handleSavePet = () => {
        const { name, species, gender } = editPetData;
        const newErrors = {
            name: name.trim() === '' ? 'Tên không được để trống' : '',
            species: species.trim() === '' ? 'Chủng loại không được để trống' : '',
            gender: gender === '' ? 'Giới tính không được để trống' : ''
        };

        if (newErrors.name || newErrors.species || newErrors.gender) {
            setErrors(newErrors);
            return;
        }

        setPets(pets.map((pet) => (pet.id === editPetData.id ? editPetData : pet)));
        setEditPetId(null);
        setErrors({ name: '', species: '', gender: '' });
    };

    const handleDeletePet = (id) => {
        setPets(pets.filter((pet) => pet.id !== id));
    };

    const handleAddPet = () => {
        const { name, species, gender } = newPetData;
        const newErrors = {
            name: name.trim() === '' ? 'Tên không được để trống' : '',
            species: species.trim() === '' ? 'Chủng loại không được để trống' : '',
            gender: gender === '' ? 'Giới tính không được để trống' : ''
        };

        if (newErrors.name || newErrors.species || newErrors.gender) {
            setErrors(newErrors);
            return;
        }

        const newPet = {
            id: pets.length + 1,
            name: newPetData.name,
            species: newPetData.species,
            gender: newPetData.gender
        };

        setPets([...pets, newPet]);
        setIsAddMode(false);
        setNewPetData({ name: '', species: '', gender: '' });
        setErrors({ name: '', species: '', gender: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (editPetId !== null) {
            setEditPetData({ ...editPetData, [name]: name === 'gender' ? genders[value] : value });
        } else {
            setNewPetData({ ...newPetData, [name]: name === 'gender' ? genders[value] : value });
        }
    };

    const handleCancelAdd = () => {
        setIsAddMode(false);
        setNewPetData({ name: '', species: '', gender: '' });
        setErrors({ name: '', species: '', gender: '' });
    };

    const handleCancelEdit = () => {
        setEditPetId(null);
        setErrors({ name: '', species: '', gender: '' });
    };

    const handleClickAddPetButton = () => {
        setIsAddMode(true);
        setErrors({ name: '', species: '', gender: '' });
    };

    const handleClickUserProfile = () => {
        navigate('/user-profile');
    };

    const handleClickPetList = () => {
        navigate('/pet-list');
    };

    const handleClickTransactionHistory = () => {
        navigate('/transaction-history');
    };

    const handleClickLogOut = () => {
        navigate('/');
    };

    return (pets &&
        <div className="flex flex-col md:flex-row">
            <div className="md:h-15 bg-gray-200 w-full md:w-1/3 p-4 flex flex-col justify-center px-10 items-center md:items-start">
                <h2 className="text-4xl font-semibold mb-4">Tài khoản</h2>
                <ul className='list-disc pl-4'>
                    <li className="mb-2 text-gray-500 cursor-pointer hover:text-blue-500 duration-500" onClick={handleClickUserProfile}>Thông tin người dùng</li>
                    <li className="mb-2 text-gray-500 cursor-pointer hover:text-blue-500 duration-500" onClick={handleClickPetList}>Danh sách thú cưng</li>
                    <li className="mb-2 text-gray-500 cursor-pointer hover:text-blue-500 duration-500" onClick={handleClickTransactionHistory}>Lịch sử giao dịch</li>
                    <li className="mb-2 text-gray-500 cursor-pointer hover:text-blue-500 duration-500" onClick={handleClickLogOut}>Đăng xuất</li>
                </ul>
            </div>
            <div className="md:w-full p-4 py-40 px-6">
                <h2 className="text-5xl text-center font-semibold mb-4">Danh sách thú cưng</h2>
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2">STT</th>
                            <th className="border px-4 py-2">Tên</th>
                            <th className="border px-4 py-2">Chủng loại</th>
                            <th className="border px-4 py-2">Giới tính</th>
                            <th className="border px-4 py-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {pets.map((pet, index) => (
                            <tr key={pet.id}>
                                <td className="border px-4 py-2">{index + 1}</td>
                                <td className="border px-4 py-2">
                                    {editPetId === pet.id ? (
                                        <>
                                            <input
                                                type="text"
                                                name="name"
                                                value={editPetData.name}
                                                onChange={handleChange}
                                                className="p-2 bg-gray-200 rounded-md w-full"
                                            />
                                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                        </>
                                    ) : (
                                        pet.name
                                    )}
                                </td>
                                <td className="border px-4 py-2">
                                    {editPetId === pet.id ? (
                                        <>
                                            <input
                                                type="text"
                                                name="species"
                                                value={editPetData.species}
                                                onChange={handleChange}
                                                className="p-2 bg-gray-200 rounded-md w-full"
                                            />
                                            {errors.species && <p className="text-red-500 text-sm mt-1">{errors.species}</p>}
                                        </>
                                    ) : (
                                        pet.species
                                    )}
                                </td>
                                <td className="border px-4 py-2">
                                    {editPetId === pet.id ? (
                                        <>
                                            <select
                                                name="gender"
                                                value={genders.indexOf(editPetData.gender)}
                                                onChange={handleChange}
                                                className="p-2 bg-gray-200 rounded-md w-full"
                                            >
                                                {genders.map((gender, index) => (
                                                    <option key={index} value={index}>{gender}</option>
                                                ))}
                                            </select>
                                            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                                        </>
                                    ) : (
                                        pet.gender
                                    )}
                                </td>
                                <td className="border px-4 py-2">
                                    {editPetId === pet.id ? (
                                        <>
                                            <button
                                                className="mr-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                                onClick={handleSavePet}
                                            >
                                                Lưu
                                            </button>
                                            <button
                                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                                onClick={handleCancelEdit}
                                            >
                                                Hủy
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className="mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                                onClick={() => handleUpdatePet(pet)}
                                            >
                                                Cập nhật
                                            </button>
                                            <button
                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                                onClick={() => handleDeletePet(pet.id)}
                                            >
                                                Xóa
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {isAddMode && (
                            <tr>
                                <td className="border px-4 py-2">{pets.length + 1}</td>
                                <td className="border px-4 py-2">
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Tên"
                                            value={newPetData.name}
                                            onChange={(e) => setNewPetData({ ...newPetData, name: e.target.value })}
                                            className="p-2 bg-gray-200 rounded-md w-full"
                                        />
                                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                    </>
                                </td>
                                <td className="border px-4 py-2">
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Chủng loại"
                                            value={newPetData.species}
                                            onChange={(e) => setNewPetData({ ...newPetData, species: e.target.value })}
                                            className="p-2 bg-gray-200 rounded-md w-full"
                                        />
                                        {errors.species && <p className="text-red-500 text-sm mt-1">{errors.species}</p>}
                                    </>
                                </td>
                                <td className="border px-4 py-2">
                                    <>
                                        <select
                                            value={newPetData.gender}
                                            onChange={(e) => setNewPetData({ ...newPetData, gender: e.target.value })}
                                            className="p-2 bg-gray-200 rounded-md w-full"
                                        >
                                            <option value="">Chọn giới tính</option>
                                            {genders.map((gender, index) => (
                                                <option key={index} value={gender}>{gender}</option>
                                            ))}
                                        </select>
                                        {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                                    </>
                                </td>
                                <td className="border px-4 py-2">
                                    <button
                                        className="mr-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                        onClick={handleAddPet}
                                    >
                                        Thêm
                                    </button>
                                    <button
                                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                        onClick={handleCancelAdd}
                                    >
                                        Hủy
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="flex justify-end mt-4">
                    <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={handleClickAddPetButton}>Thêm thú cưng</button>
                </div>
            </div>
        </div>
    );
};

export default PetList;
