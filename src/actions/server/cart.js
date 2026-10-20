

"use server";

export const handleCart = async ({ product, inc }) => {
  try {
    console.log("Cart product:", product);

    return {
      success: true,
      message: "Added to cart",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Error",
    };
  }
};