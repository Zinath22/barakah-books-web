// export default function Fail() {
//   return (
//     <div className="text-center py-20">
//       <h1 className="text-4xl text-red-600 font-bold">
//         Payment Failed
//       </h1>
//     </div>
//   );
// }


export default function FailPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-10 text-center">

        <div className="text-6xl mb-4">
          ❌
        </div>

        <h1 className="text-4xl font-bold text-red-600 mb-3">
          Payment Failed
        </h1>

        <p className="text-gray-600">
          Your payment could not be completed.
        </p>

      </div>
    </div>
  );
}