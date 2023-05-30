'use strict'

const { BadRequestError, NotFoundError } = require("../core/error.response")
const { findAllProducts } = require('../models/repositories/product.repo');
const { findAllDiscountCodeUnSelect, findAllDiscountCodeSelect, checkFoundDiscount } = require('../models/repositories/discount.repo');
const { convertToObjectIdMongodb, removeUndefinedObject } = require('../utils')
const  discount  = require('../models/discount.model');
/**
 * Discount service 
 * 1 - Generator Discount Code (shop | admin)
 * 2 - Get discount amount(User)
 * 3 - Get all discount codes (User | shop)
 * 4 - verify discount Code (Admin | shop)
 * 5 - Delete discount Code (Admin | shop)
 * 6 - Cancel discount Code (user)
 */

class DiscountService {

    // static async checkFoundDiscount(code, shopId) {
    //     return await discount.findOne({
    //         discount_code: code,
    //         discount_shopId: convertToObjectIdMongodb(shopId)
    //     }).lean();
    // }

    static async createDiscountCode(payload) {
        const {
            code, start_date, end_date, is_active,
            shopId, min_order_value, product_ids,
            users_used,
            applies_to, name, description,
            type, value, max_value, max_uses, uses_count,
            max_uses_per_user
        } = payload
        // kiem tra
        // if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
        //     throw new BadRequestError('Discount code has expried!');
        // }

        if (new Date(start_date) >= new Date(end_date)) {
            throw new BadRequestError('Discount start date must be before end date!');
        }

        // create index for discount code
        // const foundDiscount = await discount.findOne({
        //     discount_code: code,
        //     discount_shopId: convertToObjectIdMongodb(shopId)
        // }).lean();

        const foundDiscount = await checkFoundDiscount({
            model: discount,
            filter: {
                discount_code: code,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        });

        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError('Disount exists!');
        }

        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_max_value: max_value,
            discount_code: code,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used,
            discount_max_uses_per_user: max_uses_per_user,
            discount_min_order_value: min_order_value || 0,
            discount_shopId: shopId,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === 'all' ? [] : product_ids,
        });

        return newDiscount;
    }

    static async updateDiscountCode(discountId, payload) {
        const {
            code, start_date, end_date, is_active,
            shopId, min_order_value, product_ids,
            users_used,
            applies_to, name, description,
            type, value, max_value, max_uses, uses_count,
            max_uses_per_user
        } = payload;

        const inputUpdate = {
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_max_value: max_value,
            discount_code: code,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used,
            discount_max_uses_per_user: max_uses_per_user,
            discount_min_order_value: min_order_value,
            discount_shopId: shopId,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: product_ids,
        }

        const objectParams = removeUndefinedObject(inputUpdate);
        const updatedDiscount = await discount.findByIdAndUpdate(discountId, objectParams, { new: true });
        return updatedDiscount;
    }

    static async getAllDiscountCodeWithProduct({
        code,
        shopId,
        userId,
        limit,
        page
    }) {
        const foundDiscount = await checkFoundDiscount({
            model: discount,
            filter: {
                discount_code: code,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        });
        console.log(foundDiscount);
        if (!foundDiscount || !foundDiscount.discount_is_active) {
            throw new NotFoundError('Discount not exists!');
        }

        const { discount_applies_to, discount_product_ids } = foundDiscount;
        let products;
        if (discount_applies_to === 'all') {
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongodb(shopId),
                    isPublished: true,
                },
                limit: limit,
                page: page,
                sort: 'ctime',
                select: ['product_name']
            })
        }

        if (discount_applies_to === 'specific') {
            products = await findAllProducts({
                filter: {
                    _id: { $in: discount_product_ids },
                    isPublished: true,
                },
                limit: limit,
                page: page,
                sort: 'ctime',
                select: ['product_name']
            })
        }
        return products;
    }

    static async getAllDiscountCodeByShop({limit, page, shopId}) {
        const discounts = await findAllDiscountCodeUnSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true
            },
            unSelect: ['__v', 'discount_shopId'],
            model: discount
        });
        return discounts;
    }

    static async getDiscountAmount({
        codeId, userId, shopId, products
    }) {
        const foundDiscount = await checkFoundDiscount({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        });
        if (!foundDiscount) throw new NotFoundError('Discount not exists!');

        const {
            discount_is_active,
            discount_max_uses,
            discount_start_date,
            discount_end_date,
            discount_max_uses_per_user,
            discount_users_used,
            discount_type,
            discount_min_order_value,
            discount_value
        } = foundDiscount;

        if (!discount_is_active) throw new NotFoundError('Discount expried')
        if (!discount_max_uses) throw new NotFoundError('Discount are out')

        // if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
        //     throw new BadRequestError('Discount code has expried!');
        // }

        // check co set gt toi thieu cua don hang ko
        let totalOrder = 0;
        if (discount_min_order_value > 0) {
            totalOrder = products.reduce((acc, product) => {
                return acc = acc + (product.quantity * product.price);
            }, 0);
            if (totalOrder < discount_min_order_value) {
                throw new NotFoundError(`Discount requires a minimum order value of ${discount_min_order_value}`);
            }
        }

        if (discount_max_uses_per_user > 0) {
            const usesUserDiscount = discount_users_used.find(user => user.userId === userId);
            if (usesUserDiscount) {
                throw new NotFoundError('Discount must be use only one time');
            }
        }

        // check discount fixed amount
        const amount = discount_type === 'fixed_amount' ? discount_value : totalOrder * (discount_value / 100);
        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount
        }
    }

    static async deleteDiscountCode({ shopId, codeId }) {
        // co the lam ky hon bang cach query xem discount co dang dung o dau khong,
        // nguoi dung co quyen xoa khong
        // co nhieu cach xoa khac nhau, neu cap nhat lai status thi he thong van se phai dem index
        // co the luu vao mot schema khac hoac 1 csdl khac de de dang lay lai neu can
        const deleted = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongodb(shopId)
        })
        return deleted;
    }

    static async cancelDiscountCode({ codeId, shopId, userId }) {
        const foundDiscount = await checkFoundDiscount({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        });
        if (!foundDiscount) throw new NotFoundError('Discount not exists!');

        const result = await discount.findByIdAndUpdate(foundDiscount._id,
            {
                $pull: {
                    discount_users_used: userId,
                },
                $inc: {
                    discount_max_uses: 1,
                    discount_uses_count: -1
                }
            })
        return result;
    }
}

module.exports = DiscountService;

