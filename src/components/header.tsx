import * as React from "react";

const Header = ({ category, setCategory, search, setSearch }) => {
  const renderItem = (label: string, item) => {
    return (
      <div
        className={`flex px-2 py-1 rounded-full mr-2 text-xs items-center justify-center cursor-pointer ${
          item === category
            ? `bg-gray-600 text-white`
            : `bg-gray-50 hover:bg-gray-200`
        }`}
        onClick={() => setCategory(item)}
      >
        {label}
      </div>
    );
  };
  return (
    <div className="sticky top-0 bg-white shadow-sm p-2">
      <div className="w-full">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          className="w-full text-xs h-6 rounded-full bg-gray-50 px-2 focus:ring-1 focus:ring-gray-200 focus:outline-none"
          autoFocus
        />
      </div>
      <div className="overflow-y-hidden overflow-x-auto flex flex-row justify-start items-center mt-2">
        {renderItem("All", null)}
        {renderItem("Face", "face")}
        {renderItem("Game", "game")}
        {renderItem("General", "general")}
      </div>
    </div>
  );
};

export default Header;
