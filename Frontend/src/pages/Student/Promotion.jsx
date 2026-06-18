const Promotion = () => {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Promotion</h1>
        <p className="text-sm text-gray-500">
          Promote students to the next academic class.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <select className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none">
            <option>From Class</option>
          </select>
          <select className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none">
            <option>From Section</option>
          </select>
          <select className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none">
            <option>To Class</option>
          </select>
          <select className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none">
            <option>To Section</option>
          </select>
        </div>

        <div className="mt-4 flex justify-end">
          <button className="bg-blue-900 text-white px-6 py-2 rounded-lg">
            Promote
          </button>
        </div>
      </div>
    </div>
  );
};

export default Promotion;
