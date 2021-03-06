const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product')


exports.order_get_all =  (req, res, next) => {
    Order.find()
    .select('product quantity _id')
    .populate('product' ,'name')//instead of ide all object got populated
    .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map((doc => {
                    return {
                        _id: doc.id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + doc.id
                       }
                    }
                })),

            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })

};

exports.order_post_product =  (req, res, next) => {
    Product.findById(req.body.product)
        .then(product => {
            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.product
            });
            return order.save();
        })
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Order stored",
                createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity
                },
                request: {
                    type: "GET",
                    url: "http://localhost:3000/orders/" + result._id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.order_get_product = (req, res, next) => {
    Order.findById(req.params.orderId)
    .populate('product')
    .exec()
    .then(order=>{
        if(!order)
        {
            return res.status(400).json(
                {
                    message:'Order Not Found',
                }
            )
        }
        res.status(200).json({
           order:order ,
           request:{
            type: "GET",
            url: "http://localhost:3000/orders"
        }
        })
    })
    .catch((err=>{
        res.status(500).json({
            error:err
        })
    }))
}

exports.order_delete_product =  (req, res, next) => {
    Order.remove({
        _id:req.params.orderId
    })
    .exec()
    .then(order=>{
        res.status(200).json({
           message:'Order Deleted',
           request:{
            type: "POST",
            url: "http://localhost:3000/orders",
            body:{product:'ID',quantity:'Number'}
        }
        })
    })
    .catch((err=>{
        res.status(500).json({
            error:err
        })
    }))
}