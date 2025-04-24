export default function SearchBar({ setSearchTerm }) {
    const handleSubmit = (e) => {
      e.preventDefault();
      setSearchTerm(e.target.search.value.trim());
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="search"
          placeholder="Search for products..."
          className="w-full p-2 rounded bg-gray-500 text-white placeholder-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white"
        />
      </form>
    );
  }

  