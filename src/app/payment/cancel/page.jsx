// export default function Cancel() {
//   return (
//     <div className="text-center py-20">
//       <h1 className="text-4xl text-yellow-600 font-bold">
//         Payment Cancelled
//       </h1>
//     </div>
//   );
// }



export default function CancelPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-10 text-center">

        <div className="text-6xl mb-4">
          ⚠️
        </div>

        <h1 className="text-4xl font-bold text-yellow-500 mb-3">
          Payment Cancelled
        </h1>

        <p className="text-gray-600">
          You cancelled the payment process.
        </p>

      </div>
    </div>
  );
}