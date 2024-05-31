import useShopping from '../../hook/useShopping';

const Cart = () => {
    const { shoppingCart, handelUpdateQuantity, handleRemoveItem } = useShopping();

    // Calculate the total amount of the cart
    const totalAmount = shoppingCart.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="lg:text-5xl text-3xl font-bold mb-8 text-center">Shopping Cart</h1>
            <div className="bg-white shadow-lg rounded-lg p-6">
                {shoppingCart && shoppingCart.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="px-4 py-2 text-left">#</th>
                                    <th className="px-4 py-2 text-left">Sản phẩm</th>
                                    <th className="px-4 py-2 text-left">Giá</th>
                                    <th className="px-4 py-2 text-left">Số lượng</th>
                                    <th className="px-4 py-2 text-left">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shoppingCart.map((item, index) => (
                                    <tr key={item.id} className="border-t">
                                        <td className="px-4 py-2">{index + 1}</td>
                                        <td className="px-4 py-2 flex items-center">
                                            <div
                                                className="w-20 h-20 bg-cover bg-center rounded mr-4"
                                                style={{ backgroundImage: `url(${item.image})` }}
                                            ></div>
                                            <span className="text-xl font-semibold">{item.name}</span>
                                        </td>
                                        <td className="px-4 py-2">${item.price}</td>
                                        <td className="px-4 py-2">
                                            <input
                                                value={item.quantity}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value);
                                                    if (value >= 1) {
                                                        handelUpdateQuantity(item.id, value);
                                                    }
                                                }}
                                                className="w-24 p-2 border border-gray-300 rounded-md text-center"
                                                min="1"
                                                required
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-5xl text-center text-gray-500">Giỏ của bạn đang trống.</p>
                )}
            </div>
            {shoppingCart && shoppingCart.length > 0 && (
                <div className="mt-8 flex justify-end items-center">
                    <span className="text-2xl text-green-600 font-bold mr-4">Tổng tiền: ${totalAmount.toFixed(2)}</span>
                    <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
                        Thanh toán
                    </button>
                </div>
            )}
        </div>
    );
};

export default Cart;
