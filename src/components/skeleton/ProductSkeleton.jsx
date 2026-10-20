const ProductSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-base-300 bg-base-100 p-3">
    <div className="rounded-xl bg-base-200 px-6 pb-4 pt-5">
      <div className="aspect-[3/4] w-full rounded-md bg-base-300" />
    </div>
    <div className="mt-3 h-4 w-4/5 rounded bg-base-300" />
    <div className="mt-2 h-3 w-1/2 rounded bg-base-300" />
    <div className="mt-4 h-8 w-full rounded-lg bg-base-300" />
  </div>
);

export default ProductSkeleton;
