# বারাকাহ বুকস (Barakah Books)

ইসলামিক বইয়ের অনলাইন দোকান — Next.js (website) + Express (mobile app এর API) + MongoDB + Firebase Auth.

## চালানো

```bash
npm install
npm run dev            # website → http://localhost:3000
```

Express API (Flutter app এর জন্য):

```bash
cd server
npm install
npm run dev            # → http://localhost:5000
npm run seed           # ২০টি নমুনা বই database এ বসায় (একবার চালালেই হবে)
```

## দরকারি ফাইল

| ফাইল | কাজ |
|---|---|
| `.env.local` | website এর setting (MONGODB_URI, DB_NAME, NEXTAUTH_SECRET, STORE_ID...) |
| `server/.env` | server এর setting — `server/.env.example` দেখুন |
| `src/lib/books.js` | ক্যাটাগরি, ভাষা, বাঁধাই এর তালিকা আর দাম দেখানোর helper |
| `src/components/books/BookCover.jsx` | ছবি না থাকলে নিজে থেকে প্রচ্ছদ তৈরি করে |
| `src/app/page.jsx` | home page |

## বইয়ের তথ্য (MongoDB `products` collection)

`title, author, translator, publisher, category, language, binding, pages, edition, isbn, price, originalPrice, stock, img, description, rating, reviews, sold, createdAt`

`originalPrice` যদি `price` এর চেয়ে বেশি হয়, তাহলে নিজে থেকেই ছাড়ের % দেখাবে।
