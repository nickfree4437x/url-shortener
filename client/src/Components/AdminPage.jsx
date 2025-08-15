import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminPage() {
  const [urls, setUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    axios.get("http://localhost:5000/api/admin/urls")
      .then(res => {
        // Ensure we have valid data before setting state
        if (Array.isArray(res?.data)) {
          setUrls(res.data);
        } else {
          setError("Invalid data format received from server");
          setUrls([]);
        }
      })
      .catch(err => {
        console.error("Error fetching URLs:", err);
        setError("Failed to load URLs. Please try again later.");
        setUrls([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredUrls = urls.filter(url => {
    // Safely check for url properties before accessing them
    const shortCode = url?.short_code || "";
    const originalUrl = url?.original_url || "";
    
    return shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
           originalUrl.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-4 sm:p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          URL Analytics Dashboard
        </h2>
        
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search URLs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition duration-200 text-white placeholder-gray-400"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {error ? (
        <div className="p-4 mb-4 text-sm text-red-400 bg-red-900/30 rounded-lg border border-red-800">
          {error}
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-700 shadow">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Short URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Original URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Visits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                {filteredUrls.length > 0 ? (
                  filteredUrls.map((url) => (
                    <tr key={url._id} className="hover:bg-gray-700/30 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={`http://localhost:5000/${url.short_code}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:text-blue-300 font-mono"
                        >
                          /{url.short_code}
                        </a>
                      </td>
                      <td className="px-6 py-4 max-w-xs lg:max-w-md xl:max-w-lg 2xl:max-w-xl break-all">
                        <a
                          href={url.original_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-300 hover:text-white truncate block"
                          title={url.original_url}
                        >
                          {url.original_url}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          url.visit_count > 10 ? 'bg-green-900/50 text-green-400' : 
                          url.visit_count > 0 ? 'bg-blue-900/50 text-blue-400' : 
                          'bg-gray-700 text-gray-400'
                        }`}>
                          {url.visit_count || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {url.created_at ? new Date(url.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                      {searchTerm ? 'No matching URLs found' : 'No URLs available'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            Showing {filteredUrls.length} of {urls.length} URLs
          </div>
        </>
      )}
    </div>
  );
}