export default function TestTailwind() {
  return (
    <div className="p-8 m-4 bg-blue-500">
      <h1 className="text-white mb-4">Test de Tailwind</h1>
      <div className="p-4 m-2 bg-red-500">
        <p className="text-white">Padding 4, Margin 2</p>
      </div>
      <div className="px-6 py-3 mt-4 bg-green-500">
        <p className="text-white">Padding X 6, Padding Y 3, Margin Top 4</p>
      </div>
      <div className="ml-8 mr-8 mt-2 mb-2 bg-yellow-500">
        <p className="p-2">Margin Left 8, Right 8, Top 2, Bottom 2</p>
      </div>
    </div>
  );
}
