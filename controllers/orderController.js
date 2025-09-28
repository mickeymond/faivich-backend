import axios from "axios";
import { OrderModel } from "../models/orderModel.js";

export const createOrder = async (req, res, next) => {
  try {
    const {
      products,
      quantity,
      firstName,
      lastName,
      email,
      phoneNumber,
      fullAddress,
      country,
      zipCode,
      city,
      deliveryMethod,
      paymentMethod,
      subTotal,
      discount,
      deliveryCharge,
      estimatedTax,
      totalAmount
    } = req.body;

    const order = await OrderModel.create({
      products,
      user: req.auth.id, // From isAuthenticated middleware
      quantity,
      firstName,
      lastName,
      email,
      phoneNumber,
      fullAddress,
      country,
      zipCode,
      city,
      deliveryMethod,
      paymentMethod,
      subTotal,
      discount,
      deliveryCharge,
      estimatedTax,
      totalAmount
    });

    // Initiate paystack payment
    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      "email": email,
      "amount": subTotal * 100,
      "reference": order.id
    }, { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } })
    // console.log(response.data)
    if (!response.data.status) {
      await OrderModel.deleteOne({ _id: order.id });
      return res.status(412).json({ message: 'Failed to initiate payment!' });
    }
    // Return response
    res.status(201).json(response.data.data);
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Error creating order',
      error: err.message
    });
  }
};



export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await OrderModel.find()
      .populate('products') // get product details
      .populate('user')    // get user details
      .sort({ createdAt: -1 }); // latest first

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await OrderModel.find({ user: req.auth.id })
      .populate('products')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await OrderModel.findById(req.params.id)
      .populate('products')
      .populate('user');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('products').populate('user');

    res.json(order);
  } catch (err) {
    next(err);
  }
};


export const deleteOrder = async (req, res, next) => {
  try {
    const deletedOrder = await OrderModel.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    next(err);
  }
};


