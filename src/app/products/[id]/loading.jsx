export default function Loading() {
  return (
    <div className="grid animate-pulse gap-8 rounded-3xl border border-base-300 bg-base-100 p-8 md:grid-cols-[340px_1fr]">
      <div className="aspect-[3/4] w-full rounded-xl bg-base-300" />
      <div className="space-y-4">
        <div className="h-8 w-3/4 rounded bg-base-300" />
        <div className="h-4 w-1/3 rounded bg-base-300" />
        <div className="h-16 w-full rounded-xl bg-base-300" />
        <div className="h-10 w-1/2 rounded-lg bg-base-300" />
        <div className="h-40 w-full rounded-xl bg-base-300" />
      </div>
    </div>
  );
}
