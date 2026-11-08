




import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";

export async function POST(req) {
  try {
    const body = await req.json();

    // 🔥 DEBUG — দেখুন cart থেকে কী আসছে
    console.log("PAYMENT BODY:", JSON.stringify({
      amount:         body.amount,
      originalAmount: body.originalAmount,
      discountAmount: body.discountAmount,
      couponCode:     body.couponCode,
      email:          body.email,
      productsCount:  body.products?.length,
    }));

    const amount = Number(body.amount);

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount" },
        { status: 400 }
      );
    }

    const tran_id = Date.now().toString();

    const formData = new FormData();

    formData.append("store_id",     process.env.STORE_ID);
    formData.append("store_passwd", process.env.STORE_PASSWORD);
    formData.append("total_amount", amount.toString());
    formData.append("currency",     "BDT");
    formData.append("tran_id",      tran_id);

    formData.append("success_url", `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`);
    formData.append("fail_url",    `${process.env.NEXT_PUBLIC_BASE_URL}/payment/fail`);
    formData.append("cancel_url",  `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`);
    formData.append("ipn_url",     `${process.env.NEXT_PUBLIC_BASE_URL}/api/ipn`);

    formData.append("cus_name",     body.name  || "Customer");
    formData.append("cus_email",    body.email || "customer@test.com");
    formData.append("cus_add1",     String(body.address || "Dhaka").slice(0, 100));
    formData.append("cus_add2",     "Dhaka");
    formData.append("cus_city",     "Dhaka");
    formData.append("cus_state",    "Dhaka");
    formData.append("cus_postcode", "1207");
    formData.append("cus_country",  "Bangladesh");
    formData.append("cus_phone",    body.phone || "01700000000");
    formData.append("cus_fax",      "01700000000");

    formData.append("ship_name",     body.name || "Customer");
    formData.append("ship_add1",     String(body.address || "Dhaka").slice(0, 100));
    formData.append("ship_add2",     "Dhaka");
    formData.append("ship_city",     "Dhaka");
    formData.append("ship_state",    "Dhaka");
    formData.append("ship_postcode", "1207");
    formData.append("ship_country",  "Bangladesh");

    formData.append("shipping_method",  "Courier");
    formData.append("product_name",     "Islamic Books");
    formData.append("product_category", "Books");
    formData.append("product_profile",  "general");
    formData.append("product_amount",   "1");

    const response = await fetch(
      "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
      { method: "POST", body: formData }
    );

    const data = await response.json();

    console.log("SSL RESPONSE:", data.status);

    if (!data.GatewayPageURL) {
      return NextResponse.json(
        {
          success: false,
          message: data.failedreason || "SSLCommerz Error",
        },
        { status: 400 }
      );
    }

    // Save order to MongoDB with coupon info
    // try {
    //   const db = await dbConnect();

    //   const orderData = {
    //     userEmail:      body.email        || "customer@test.com",
    //     products:       body.products     || [],
    //     originalAmount: Number(body.originalAmount) || amount,
    //     discountAmount: Number(body.discountAmount) || 0,
    //     total:          amount,
    //     couponCode:     body.couponCode   || null,
    //     payment:        "Paid",
    //     status:         "Pending",
    //     tran_id,
    //     createdAt:      new Date(),
    //   };

      

    //   await db.collection("orders").insertOne(orderData);

    //   console.log("ORDER SAVED ✅");
    // } catch (orderError) {
    //   console.log("ORDER SAVE ERROR:", orderError.message);
    // }

    // Record coupon usage
    if (body.couponCode && body.email) {
      try {
        const db = await dbConnect();

        await db.collection("coupons").updateOne(
          { code: body.couponCode.toUpperCase().trim() },
          {
            $inc:      { usedCount: 1 },
            $addToSet: { usedBy: body.email },
          }
        );

        console.log("COUPON USAGE RECORDED:", body.couponCode);
      } catch (couponError) {
        console.log("COUPON RECORD ERROR:", couponError.message);
      }
    }

    return NextResponse.json({
      success: true,
      url: data.GatewayPageURL,
    });

  } catch (error) {
    console.log("PAYMENT ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}




// import { NextResponse } from "next/server";
// import { dbConnect } from "@/lib/dbConnect";

// export async function POST(req) {
//   try {
//     const body = await req.json();

//     // 🔥 DEBUG — দেখুন cart থেকে কী আসছে
//     console.log("PAYMENT BODY:", JSON.stringify({
//       amount:         body.amount,
//       originalAmount: body.originalAmount,
//       discountAmount: body.discountAmount,
//       couponCode:     body.couponCode,
//       email:          body.email,
//       productsCount:  body.products?.length,
//     }));

//     const amount = Number(body.amount);

//     if (isNaN(amount) || amount <= 0) {
//       return NextResponse.json(
//         { success: false, message: "Invalid amount" },
//         { status: 400 }
//       );
//     }

//     const tran_id = Date.now().toString();

//     const formData = new FormData();

//     formData.append("store_id",     process.env.STORE_ID);
//     formData.append("store_passwd", process.env.STORE_PASSWORD);
//     formData.append("total_amount", amount.toString());
//     formData.append("currency",     "BDT");
//     formData.append("tran_id",      tran_id);

//     formData.append("success_url", `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`);
//     formData.append("fail_url",    `${process.env.NEXT_PUBLIC_BASE_URL}/payment/fail`);
//     formData.append("cancel_url",  `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`);
//     formData.append("ipn_url",     `${process.env.NEXT_PUBLIC_BASE_URL}/api/ipn`);

//     formData.append("cus_name",     body.name  || "Customer");
//     formData.append("cus_email",    body.email || "customer@test.com");
//     formData.append("cus_add1",     "Dhaka");
//     formData.append("cus_add2",     "Dhaka");
//     formData.append("cus_city",     "Dhaka");
//     formData.append("cus_state",    "Dhaka");
//     formData.append("cus_postcode", "1207");
//     formData.append("cus_country",  "Bangladesh");
//     formData.append("cus_phone",    body.phone || "01700000000");
//     formData.append("cus_fax",      "01700000000");

//     formData.append("ship_name",     body.name || "Customer");
//     formData.append("ship_add1",     "Dhaka");
//     formData.append("ship_add2",     "Dhaka");
//     formData.append("ship_city",     "Dhaka");
//     formData.append("ship_state",    "Dhaka");
//     formData.append("ship_postcode", "1207");
//     formData.append("ship_country",  "Bangladesh");

//     formData.append("shipping_method",  "Courier");
//     formData.append("product_name",     "Islamic Books");
//     formData.append("product_category", "Books");
//     formData.append("product_profile",  "general");
//     formData.append("product_amount",   "1");

//     const response = await fetch(
//       "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
//       { method: "POST", body: formData }
//     );

//     const data = await response.json();

//     console.log("SSL RESPONSE:", data.status);

//     if (!data.GatewayPageURL) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: data.failedreason || "SSLCommerz Error",
//         },
//         { status: 400 }
//       );
//     }

//     // Save order to MongoDB with coupon info
//     // try {
//     //   const db = await dbConnect();

//     //   const orderData = {
//     //     userEmail:      body.email        || "customer@test.com",
//     //     products:       body.products     || [],
//     //     originalAmount: Number(body.originalAmount) || amount,
//     //     discountAmount: Number(body.discountAmount) || 0,
//     //     total:          amount,
//     //     couponCode:     body.couponCode   || null,
//     //     payment:        "Paid",
//     //     status:         "Pending",
//     //     tran_id,
//     //     createdAt:      new Date(),
//     //   };

      

//     //   await db.collection("orders").insertOne(orderData);

//     //   console.log("ORDER SAVED ✅");
//     // } catch (orderError) {
//     //   console.log("ORDER SAVE ERROR:", orderError.message);
//     // }

//     // Record coupon usage
//     if (body.couponCode && body.email) {
//       try {
//         const db = await dbConnect();

//         await db.collection("coupons").updateOne(
//           { code: body.couponCode.toUpperCase().trim() },
//           {
//             $inc:      { usedCount: 1 },
//             $addToSet: { usedBy: body.email },
//           }
//         );

//         console.log("COUPON USAGE RECORDED:", body.couponCode);
//       } catch (couponError) {
//         console.log("COUPON RECORD ERROR:", couponError.message);
//       }
//     }

//     return NextResponse.json({
//       success: true,
//       url: data.GatewayPageURL,
//     });

//   } catch (error) {
//     console.log("PAYMENT ERROR:", error);

//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }