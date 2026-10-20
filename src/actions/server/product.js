

"use server";

import { dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

// 🔥 GET ALL PRODUCTS
export const getProducts = async () => {
  try {
    const db = await dbConnect();

    const products = await db
      .collection("products")
      .find({})
      .toArray();

    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.log("getProducts error:", error);
    return [];
  }
};

// 🔥 GET SINGLE PRODUCT (FULL SAFE)
export const getSingleProduct = async (id) => {
  try {
    const db = await dbConnect();

    let product = null;

    // 1️⃣ MongoDB ObjectId check
    if (ObjectId.isValid(id)) {
      product = await db.collection("products").findOne({
        _id: new ObjectId(id),
      });
    }

    // 2️⃣ fallback: normal id
    if (!product) {
      product = await db.collection("products").findOne({
        id: id,
      });
    }

    // 3️⃣ fallback: slug
    if (!product) {
      product = await db.collection("products").findOne({
        slug: id,
      });
    }

    return product ? JSON.parse(JSON.stringify(product)) : null;
  } catch (error) {
    console.log("getSingleProduct error:", error);
    return null;
  }
};