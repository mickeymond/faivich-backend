import { Schema, model } from "mongoose";
import normalize from 'normalize-mongoose';
import { nanoid } from 'nanoid';

const orderSchema = new Schema({
    _id: {
        type: String,
        default: () => nanoid(7),
    },
    products: [{
        id: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered'],
        default: 'pending'
    },

    // Customer Info
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },

    // Address Info
    fullAddress: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
    city: { type: String, required: true },

    // Delivery
    deliveryMethod: {
        type: String,
        enum: ['Motorcycle', 'Courier Van'],
        required: true
    },

    // Payment
    paymentMethod: {
        type: String,
        enum: ['Mobile Money', 'Cash on Delivery'],
        required: true
    },

    // Order Summary
    subTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, required: true },
    estimatedTax: { type: Number, required: true },
    totalAmount: { type: Number, required: true }

}, {
    timestamps: true,
    _id: false,
    id: false
});

orderSchema.plugin(normalize);

export const OrderModel = model('Order', orderSchema);
