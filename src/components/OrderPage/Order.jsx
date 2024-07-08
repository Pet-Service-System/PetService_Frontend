import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Radio,
  Typography,
  Image,
  Input,
  Button,
  message,
} from "antd";
import { PayPalButtons } from "@paypal/react-paypal-js";
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
const REACT_APP_EXCHANGE_RATE_VND_TO_USD = import.meta.env
  .REACT_APP_EXCHANGE_RATE_VND_TO_USD;
const REACT_APP_SHIPPING_COST = import.meta.env.REACT_APP_SHIPPING_COST;
import useShopping from '../../hook/useShopping';

const { Title, Text } = Typography;
const API_URL = import.meta.env.REACT_APP_API_URL;

const Order = () => {
  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState("nationwide");
  const shippingCost = parseFloat(REACT_APP_SHIPPING_COST);
  const [orderDetails, setOrderDetails] = useState({
    totalAmount: 0,
    shippingCost: shippingCost,
    cartItems: JSON.parse(localStorage.getItem("shoppingCart")) || [], // Load cartItems from localStorage
  });
  const [productDetails, setProductDetails] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    fullname: "",
    address: "",
    phone: "",
  });
  const [isPayPalEnabled, setIsPayPalEnabled] = useState(false);
  const [voucherCode, setVoucherCode] = useState(""); // State for voucher code
  const [editMode, setEditMode] = useState(false); // State for edit mode
  const [originalCustomerInfo, setOriginalCustomerInfo] = useState({}); // State to store original values
  const navigate = useNavigate();
  const exchangeRateVNDtoUSD = parseFloat(REACT_APP_EXCHANGE_RATE_VND_TO_USD);
  const { t } = useTranslation();
  const { handleRemoveItem } = useShopping();
  const [discountValue, setDiscountValue] = useState(0); // State for discount value

  useEffect(() => {
    const addressInfo = JSON.parse(localStorage.getItem("addressInfo"));
    if (addressInfo) {
      setCustomerInfo(addressInfo);
      setOriginalCustomerInfo(addressInfo);
    }
  }, []);

  useEffect(() => {
    if (orderDetails.cartItems.length === 0) {
      navigate(-1); // Navigate back if the cart is empty
    }
  }, [orderDetails.cartItems, navigate, t]);

  useEffect(() => {
    const totalAmount = parseFloat(localStorage.getItem("totalAmount")) || 0;
    setOrderDetails((prevOrderDetails) => ({
      ...prevOrderDetails,
      totalAmount: totalAmount,
    }));

    setIsPayPalEnabled(true);
  }, []);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // fetch product data from product by id
        const fetchedDetails = await Promise.all(
          orderDetails.cartItems.map(async (item) => {
            const response = await axios.get(
              `${API_URL}/api/products/${item.ProductID}`,
              config
            );
            return { ...response.data, Quantity: item.Quantity };
          })
        );
        // check if product is available
        setProductDetails(
          fetchedDetails.filter((product) => product.Status === "Available")
        );
      } catch (error) {
        console.error("Error fetching product details:", error);
        message.error("Error fetching product details.");
      }
    };

    fetchProductDetails();
  }, [orderDetails.cartItems]);

  const handleShippingChange = (e) => {
    const shippingMethod = e.target.value;

    setSelectedShippingMethod(shippingMethod);
    setOrderDetails({
      ...orderDetails,
      shippingCost: shippingCost,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prevCustomerInfo) => ({
      ...prevCustomerInfo,
      [name]: value,
    }));

    // Update localStorage immediately with the updated customerInfo
    localStorage.setItem(
      "addressInfo",
      JSON.stringify({
        ...customerInfo, // Use current state here as setCustomerInfo is async
        [name]: value,
      })
    );
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const saveChanges = () => {
    localStorage.setItem("addressInfo", JSON.stringify(customerInfo));
    setOriginalCustomerInfo(customerInfo); // Update originalCustomerInfo with current state
    setEditMode(false);
  };

  const cancelEdit = () => {
    setCustomerInfo(originalCustomerInfo); // Revert to original state
    setEditMode(false);
  };

  const updateInventoryQuantity = async (orderDetails) => {
    try {
      // Iterate over each product in the order details
      for (const item of orderDetails.cartItems) {
        // Make an API call to get current inventory quantity
        const inventoryResponse = await axios.get(
          `${API_URL}/api/products/${item.ProductID}`
        );

        if (inventoryResponse.status !== 200) {
          throw new Error(
            `Failed to fetch inventory for ProductID ${item.ProductID}`
          );
        }

        const currentInventory = inventoryResponse.data.Quantity;

        // Validate item.Quantity before proceeding
        if (typeof item.Quantity !== "number") {
          throw new Error(
            `Invalid quantity data for ProductID ${item.ProductID}`
          );
        }

        // Check if there is sufficient inventory
        if (currentInventory < item.Quantity) {
          throw new Error(
            `Not enough inventory available for ProductID ${item.ProductID}`
          );
        }

        // Calculate the new quantity after purchase
        const newQuantity = currentInventory - item.Quantity;

        // Update product status to "unavailable" if newQuantity is 0
      const newStatus = newQuantity === 0 ? "Unavailable" : "Available";

        // Make an API call to update the inventory
        const response = await axios.patch(
          `${API_URL}/api/products/${item.ProductID}`,
          {
            Quantity: newQuantity,
            Status: newStatus,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(
            `Failed to update inventory for ProductID ${item.ProductID}`
          );
        }

        console.log(
          `Inventory updated successfully for ProductID ${item.ProductID}`
        );
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
      // Handle error appropriately, e.g., show a message to the user
      message.error("Đã xảy ra lỗi khi cập nhật số lượng tồn kho.");
    }
  };

  const deleteCartItem = async (productId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const AccountID = user.id
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/api/cart/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          AccountID: AccountID,
          ProductID: productId,
        }
      });
      console.log(`Deleted product ${productId} from cart`);
    } catch (error) {
      console.error(`Error deleting product ${productId} from cart:`, error);
    }
  };
  
  const checkVoucher = async () => {
    try {
      if (voucherCode.trim() === '') {
        return;
      }
      const response = await axios.get(`${API_URL}/api/voucher/pattern/${voucherCode}`);
      const voucher = response.data;

      // Check if the voucher is valid and apply the discount
      if (voucher) {
        await setDiscountValue(voucher.DiscountValue);
        message.success(t("voucher_applied"));
      } else {
        message.error(t("invalid_voucher"));
      }
    } catch (error) {
      console.error(`Error:`, error);
      message.error(t("invalid_voucher"));
    }
  };

  const updateVoucherUsageLimit = async () => {
    try {
      if (voucherCode.trim() === '') {
        return;
      }
      const response = await axios.put(`${API_URL}/api/voucher/pattern/${voucherCode}`);
      return(response.data)
    } catch (error) {
      console.error(`Error:`, error);
      message.error(t("invalid_voucher"));
    }
  };

  const createOrder = (data, actions) => {
    const totalAmountWithDiscount = (
      orderDetails.totalAmount +
      orderDetails.shippingCost -
      discountValue
    ).toFixed(2);

    const totalAmountInUSD = (totalAmountWithDiscount * exchangeRateVNDtoUSD).toFixed(2);
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: totalAmountInUSD,
          },
        },
      ],
    });
  };

  const onApprove = async (data, actions) => {
    try {
      if (orderDetails.cartItems.length === 0) {
        throw new Error(t("no_product_in_order"));
      }
      const paypalOrder = await actions.order.capture();
      const orderData = {
        Status: "Processing",
        TotalPrice: orderDetails.totalAmount + orderDetails.shippingCost,
        AccountID: JSON.parse(localStorage.getItem("user")).id,
        OrderDate: new Date(),
        PaypalOrderID: paypalOrder.purchase_units[0].payments.captures[0].id,
      };

      // Call the createOrder API using Axios
      const orderResponse = await axios.post(
        `${API_URL}/api/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Order created:", orderResponse.data);

      const addressInfo = JSON.parse(localStorage.getItem("addressInfo"));
      if (addressInfo) {
        setCustomerInfo({
          fullname: addressInfo.fullname,
          address: addressInfo.address,
          phone: addressInfo.phone,
        });
      }

      const filteredCartItems = orderDetails.cartItems.filter(item => item.Status === 'Available');
      const orderDetailsData = {
        OrderID: orderResponse.data.OrderID,
        CustomerName: customerInfo.fullname,
        Address: customerInfo.address,
        Phone: customerInfo.phone,
        Items: filteredCartItems.map(item => ({
          ProductID: item.ProductID,
          Quantity: item.Quantity,
        })),
      };

      const detailsResponse = await axios.post(
        `${API_URL}/api/order-details`,
        orderDetailsData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Add authorization header if needed
          },
        }
      );

      console.log("Order details created:", detailsResponse.data);

      await updateInventoryQuantity(orderDetails);
      
      if (voucherCode) {
        try {
          await updateVoucherUsageLimit();
        } catch (error) {
          console.error('Error updating voucher usage limit:', error)
        }
      }

      // Xóa các sản phẩm đã thanh toán thành công khỏi giỏ hàng trong cơ sở dữ liệu
      await Promise.all(orderDetails.cartItems.map(async (item) => {
        if (item.Status === 'Available') {
          await deleteCartItem(item.ProductID);
          handleRemoveItem(item.ProductID)
        }
      }));
      
      setTimeout(() => {
        
        navigate("/purchase-order-successfully", { replace: true });
      }, 700);
    } catch (error) {
      console.error("Error during PayPal checkout:", error);
      // Handle error
      message.error("Đã xảy ra lỗi trong quá trình thanh toán với PayPal.");
    }
  };

  const onError = (err) => {
    message.error("Đã xảy ra lỗi trong quá trình thanh toán với PayPal.");
    console.error("Error during PayPal checkout:", err);
  };

  return (
    <div>
      <div className="flex flex-row md:flex-row m-5 px-8">
        {/* Go back button */}
        <Button
          onClick={() => navigate(-1)}
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-300"
          icon={<ArrowLeftOutlined />}
          size="large"
        >
          {t("back")}
        </Button>
      </div>
      <div className="flex items-center justify-center bg-gray-100 px-10">
        <Row gutter={[16, 16]} className="w-full">
          {/* Delivery Address and List of Products */}
          <Col xs={24} md={16}>
            <div className="p-8 bg-white rounded-lg shadow-md mb-4 mt-4">
              <div className="flex justify-between items-center mb-6">
                <Title level={3} className="mb-0">
                  {t("delivery_address")}
                </Title>
                {!editMode ? (
                  <Button
                    onClick={toggleEditMode}
                    icon={<EditOutlined />}
                    type="text"
                  >
                    {t("edit")}
                  </Button>
                ) : (
                  <div>
                    <Button
                      onClick={saveChanges}
                      icon={<SaveOutlined />}
                      type="primary"
                      className="mr-2"
                    >
                      {t("save")}
                    </Button>
                    <Button
                      onClick={cancelEdit}
                      icon={<CloseOutlined />}
                      type="default"
                    >
                      {t("cancel")}
                    </Button>
                  </div>
                )}
              </div>
              <Text strong>{t("fullname")}:</Text>
              <Input
                name="fullname"
                value={customerInfo.fullname}
                onChange={handleInputChange}
                className="mb-2"
                disabled={!editMode} // Disable input if not in edit mode
              />
              <br />
              <Text strong>{t("adress")}:</Text>
              <Input
                name="address"
                value={customerInfo.address}
                onChange={handleInputChange}
                className="mb-2"
                disabled={!editMode} // Disable input if not in edit mode
              />
              <br />
              <Text strong>{t("phone")}:</Text>
              <Input
                name="phone"
                value={customerInfo.phone}
                onChange={handleInputChange}
                className="mb-2"
                disabled={!editMode} // Disable input if not in edit mode
              />
            </div>
            <div className="p-8 bg-white rounded-lg shadow-md mt-4 md:mb-2">
              <Title level={3} className="mb-6">
                {t("list_of_product")}
              </Title>
              {productDetails.map((item, index) => {
                const totalPrice = (item.Price * item.Quantity).toLocaleString(
                  "en-US"
                );
                return (
                  <Row key={index} className="mb-4" gutter={[16, 16]}>
                    <Col span={4}>
                      <Image
                        src={item.ImageURL}
                        alt={item.ProductName}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </Col>
                    <Col span={4}>
                      <Text strong>{item.ProductName}</Text>
                    </Col>
                    <Col span={4}>
                      {t("quantity")}: <Text>{item.Quantity}</Text>
                    </Col>
                    <Col span={4}>
                      {t("unit_price")}:{" "}
                      <Text>{item.Price.toLocaleString("en-US")}</Text>
                    </Col>
                    <Col span={4}>
                      {t("total")}:{" "}
                      <Text className="text-green-600">
                        {totalPrice.toLocaleString("en-US")}
                      </Text>
                    </Col>
                  </Row>
                );
              })}
            </div>
          </Col>
          {/* Shipping Method and Total Amount  */}
          <Col xs={24} md={8}>
            {/* <div className="p-8 bg-white rounded-lg shadow-md mb-4 mt-4">
              <Title level={3} className="mb-6">{t('shipping_method')}</Title>
              <Radio.Group
                value={selectedShippingMethod}
                onChange={handleShippingChange}
              >
                <Radio value="nationwide" className="font-medium block mb-2">{t('shipping_fee_nationwide')} ({shippingCost.toLocaleString('en-US')}đ)</Radio>
              </Radio.Group>
            </div> */}
            <div className="p-8 bg-white rounded-lg shadow-md mb-4 mt-4">
              <Title level={3} className="mb-6">
                {t("shipping_method")}
              </Title>
              <Radio.Group
                value={selectedShippingMethod}
                onChange={handleShippingChange}
              >
                <Radio value="nationwide" className="font-medium block mb-2">
                  {t("shipping_fee_nationwide")} (
                  {shippingCost.toLocaleString("en-US")}đ)
                </Radio>
              </Radio.Group>
            </div>

            <div className="p-8 bg-white rounded-lg shadow-md mb-4 mt-4">
              <Title level={3} className="mb-6">
                {t("voucher")}
              </Title>
              <div className="mb-4">
                <Input
                  placeholder={t("enter_voucher_code")}
                  value={voucherCode} // Value binding for the voucher code input
                  onChange={(e) => setVoucherCode(e.target.value)} // Update state on input change
                  className="mb-2"
                />
                <Button type="primary" className="mt-2" onClick={checkVoucher}>
                  {t("apply_voucher")}
                </Button>
              </div>
            </div>

            <div className="p-8 bg-white rounded-lg shadow-md mb-4 mt-4">
              <Title level={3} className="mb-6">
                {t("total_amount")}
              </Title>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <Text strong>{t("total_2")}:</Text>
                  <Text>
                    {orderDetails.totalAmount.toLocaleString("en-US")}
                  </Text>
                </div>
                <div className="flex justify-between mb-2">
                  <Text strong>{t("shipping_fee")}:</Text>
                  <Text>
                    {orderDetails.shippingCost.toLocaleString("en-US")}
                  </Text>
                </div>
                {discountValue > 0 && (
                    <div className="flex justify-between mb-2">
                      <Text strong>{t("voucher_applied")}:</Text>
                      <Text className="text-red-600">
                        -{(discountValue).toLocaleString("en-US")}
                      </Text>
                  </div>
                )}
                <div className="flex justify-between">
                  <Text strong>{t("total_3")}:</Text>
                  <Text className="text-2xl text-green-600">
                    {(
                      orderDetails.totalAmount + orderDetails.shippingCost - discountValue
                    ).toLocaleString("en-US")}
                  </Text>
                </div>
              </div>
              <div className="text-right">
                {/* PayPal Buttons */}
                {isPayPalEnabled && !editMode && (
                  <PayPalButtons
                    createOrder={createOrder}
                    onApprove={(data, actions) => onApprove(data, actions)}
                    onError={(err) => onError(err)}
                  />
                )}
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Order;