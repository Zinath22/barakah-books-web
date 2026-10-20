# Barakah Books API (Express)

Web (Next.js) ar **Flutter mobile app** — duitar jonno ekta common REST API.
Same MongoDB database ar same Firebase Auth use kore, tai web e kora account diye app e login kora jabe.

## Setup

```bash
cd server
npm install
cp .env.example .env      # tarpor .env e nijer value boshao
npm run dev               # http://localhost:5000
```

Node.js **20.6+** lagbe (`.env` file Node nijei load kore, `dotenv` lage na).

### Firebase Admin key
Firebase Console → Project settings → **Service accounts** → *Generate new private key*.
Download kora JSON theke `project_id`, `client_email`, `private_key` `.env` e boshao.
⚠️ Ei key kokhono GitHub e push korben na.

## Authentication

Client (web/Flutter) Firebase Auth diye login kore, tarpor protiti protected request e:

```
Authorization: Bearer <Firebase ID token>
```

Server token verify kore, ar MongoDB `users` collection theke `role` (user/admin) dekhe.
Login/register er pore ekbar `POST /api/users/save` call korte hobe.

## Endpoints

🔓 = public · 🔑 = login lagbe · 👑 = admin

| Method | Path | | Kaj |
|---|---|---|---|
| GET | `/api/health` | 🔓 | Server cholche kina |
| GET | `/api/products?search=&category=&sort=&page=&limit=` | 🔓 | Product list (sort: `price_asc`, `price_desc`, `rating`, `newest`) |
| GET | `/api/products/:id` | 🔓 | Ekta product (ObjectId / id / slug) |
| POST | `/api/products` | 👑 | Product add |
| PATCH | `/api/products/:id` | 👑 | Product update |
| DELETE | `/api/products/:id` | 👑 | Product delete |
| GET | `/api/reviews?productId=` | 🔓 | Review list |
| POST | `/api/reviews` | 🔑 | `{ productId, rating, comment }` |
| POST | `/api/users/save` | 🔑 | Login er pore user save/update |
| GET / PATCH | `/api/users/me` | 🔑 | Nijer profile dekha / update (`name, image, phone, address`) |
| GET | `/api/users` | 👑 | Sob user |
| PATCH | `/api/users/:id/make-admin` | 👑 | Admin banano |
| DELETE | `/api/users/:id` | 👑 | User delete |
| GET | `/api/cart` | 🔑 | Nijer cart (product details soho) |
| POST | `/api/cart/items` | 🔑 | `{ productId, qty }` |
| PATCH | `/api/cart/items/:productId` | 🔑 | `{ qty }` (0 = remove) |
| DELETE | `/api/cart/items/:productId` | 🔑 | Item remove |
| DELETE | `/api/cart` | 🔑 | Cart khali |
| GET | `/api/cart/all` | 👑 | Sob user er cart |
| GET | `/api/wishlist` | 🔑 | Wishlist |
| POST / DELETE | `/api/wishlist/:productId` | 🔑 | Add / remove |
| POST | `/api/coupons/validate` | 🔑 | `{ code, orderAmount }` |
| GET / POST | `/api/coupons` | 👑 | Coupon list / create |
| PATCH / DELETE | `/api/coupons/:id` | 👑 | Coupon update / delete |
| POST | `/api/orders` | 🔑 | Cash on Delivery order (niche dekho) |
| GET | `/api/orders/my` | 🔑 | Nijer order |
| GET | `/api/orders/:id` | 🔑 | Ekta order (owner ba admin) |
| PATCH | `/api/orders/:id/cancel` | 🔑 | Pending order cancel |
| GET | `/api/orders?status=` | 👑 | Sob order |
| PATCH | `/api/orders/:id/status` | 👑 | `{ status }`: Pending / Approved / Shipped / Delivered / Cancelled |
| POST | `/api/otp/send` · `/api/otp/verify` | 🔓 | Email OTP |
| POST | `/api/payment/init` | 🔑 | SSLCommerz payment shuru → `{ url, tranId }` |
| GET | `/api/payment/status/:tranId` | 🔑 | Payment er result |

### Order / Payment body

```json
{
  "items": [{ "productId": "6650...", "qty": 2 }],
  "couponCode": "SAVE10",
  "name": "Farhan",
  "phone": "017XXXXXXXX",
  "address": "Mirpur, Dhaka"
}
```

**Dam (price) server DB theke hisab kore** — client je price pathabe seta use hoy na, tai keu dam bodlate parbe na.

### SSLCommerz flow (Flutter)
1. `POST /api/payment/init` → `url` ashbe
2. `url` ta **WebView** e kholo
3. Payment sesh hole page `CLIENT_URL/payment/success?tran_id=...` (ba `/fail`, `/cancel`) e jabe —
   WebView er `onNavigationRequest` e ei path dhore WebView bondho koro
4. `GET /api/payment/status/:tranId` diye final result dekhao

Local e test korte SSLCommerz callback er jonno server public hote hobe — `ngrok http 5000` chalaye
oi URL `SERVER_URL` e dao.

## Flutter theke call kora (Dart example)

```dart
import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';

final dio = Dio(BaseOptions(baseUrl: 'http://10.0.2.2:5000/api')) // Android emulator
  ..interceptors.add(InterceptorsWrapper(onRequest: (options, handler) async {
    final token = await FirebaseAuth.instance.currentUser?.getIdToken();
    if (token != null) options.headers['Authorization'] = 'Bearer $token';
    handler.next(options);
  }));

Future<List<dynamic>> getProducts() async {
  final res = await dio.get('/products');
  return res.data['products'];
}

Future<void> addToCart(String productId) =>
    dio.post('/cart/items', data: {'productId': productId, 'qty': 1});
```

> Android emulator e `localhost` er bodole `10.0.2.2`, real phone e PC er LAN IP (jemon `192.168.0.105`) use koro.

## Folder structure

```
server/
├── src/
│   ├── index.js            ← server start
│   ├── app.js              ← express app, middleware, routes
│   ├── config/             ← db.js (MongoDB), firebase.js (Admin SDK)
│   ├── middleware/         ← verifyToken, verifyAdmin, errorHandler
│   ├── routes/             ← URL → controller
│   ├── controllers/        ← asol logic
│   └── utils/              ← pricing (coupon + total), ApiError, objectId
├── .env.example
└── package.json
```

## Deploy
Render / Railway / VPS — jekono Node host e deploy kora jabe.
Start command: `npm start`. Host er dashboard e `.env` er sob variable boshate hobe.
