export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
      </div>
      <p className="text-slate-400 text-sm font-medium animate-pulse">{text}</p>
    </div>
  );
}
