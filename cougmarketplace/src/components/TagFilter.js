import { useRef, useEffect } from "react";

export default function TagFilter({
  allTags,
  selectedTags,
  setSelectedTags,
  tagDropdownOpen,
  setTagDropdownOpen,
  tagQuery,
  setTagQuery,
}) {
  const tagDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(event.target)
      ) {
        setTagDropdownOpen(false);
      }
    }

    if (tagDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tagDropdownOpen]);

  return (
    <div className="relative mt-4 w-full">
      <button
        type="button"
        onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
        className="w-full text-left bg-white border border-gray-300 rounded p-2 text-gray-700 hover:ring-2 ring-red-400 focus:outline-none"
      >
        {selectedTags.length > 0
          ? `Filter tags (${selectedTags.length})`
          : "Select tags"}
      </button>

      {tagDropdownOpen && (
        <div
          ref={tagDropdownRef}
          className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded shadow-lg"
        >
          <div className="p-2">
            <input
              type="text"
              placeholder="Search tags..."
              onChange={(e) => setTagQuery(e.target.value)}
              className="w-full p-2 rounded bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="max-h-30 overflow-y-auto divide-y divide-gray-100">
            <div className="grid grid-cols-1 gap-1">
              {allTags
                .filter((tag) =>
                  tag.toLowerCase().includes(tagQuery.toLowerCase())
                )
                .map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <div
                      key={tag}
                      onClick={() =>
                        setSelectedTags(
                          isSelected
                            ? selectedTags.filter((t) => t !== tag)
                            : [...selectedTags, tag]
                        )
                      }
                      className={`cursor-pointer px-4 py-2 text-sm ${
                        isSelected
                          ? "bg-red-200 text-gray-800 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {tag}
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="p-2 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="bg-red-600 text-white text-xs px-3 py-1 rounded-full flex items-center"
                >
                  {tag}
                  <button
                    onClick={() =>
                      setSelectedTags(selectedTags.filter((t) => t !== tag))
                    }
                    className="ml-2 text-white hover:text-gray-200"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

