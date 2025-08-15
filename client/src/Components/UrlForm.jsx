import { useState, useEffect } from "react";
import axios from "axios";
import QRCode from "qrcode";

export default function UrlForm() {
  const [longUrl, setLongUrl] = useState("");
  const [expiryHours, setExpiryHours] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [preview, setPreview] = useState(null);
  const [qrCode, setQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Link Preview
  useEffect(() => {
    const fetchPreview = async () => {
      if (longUrl && longUrl.startsWith("http")) {
        try {
          const res = await axios.post("https://url-shortener-vfmn.onrender.com/api/preview", { url: longUrl });
          setPreview(res.data);
        } catch {
          setPreview(null);
        }
      } else {
        setPreview(null);
      }
    };
    const delay = setTimeout(fetchPreview, 500);
    return () => clearTimeout(delay);
  }, [longUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("https://url-shortener-vfmn.onrender.com/api/shorten", { 
        original_url: longUrl,
        expiry_hours: expiryHours ? Number(expiryHours) : null 
      });
      
      setShortUrl(res.data.short_url);
      setExpiresAt(res.data.expires_at || null);

      // Generate QR Code
      const qr = await QRCode.toDataURL(res.data.short_url);
      setQrCode(qr);
    } catch (error) {
      console.error("Error shortening URL:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700">
      <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        URL Shortener
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="Paste your long URL here..."
            className="w-full px-3 py-2 rounded-lg focus:outline-none bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition duration-200 text-white placeholder-gray-400"
            required
          />
          {longUrl && (
            <button
              type="button"
              onClick={() => setLongUrl("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="number"
              value={expiryHours}
              onChange={(e) => setExpiryHours(e.target.value)}
              placeholder="Expiry in hours (optional)"
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition duration-200 text-white placeholder-gray-400"
              min="1"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
              isLoading
                ? "bg-blue-700 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            } text-white shadow-lg`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Shortening...
              </span>
            ) : (
              "Shorten URL"
            )}
          </button>
        </div>
      </form>

      {/* Link Preview */}
      {preview && (
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700 transition-all duration-300 hover:border-gray-600">
          <div className="flex items-start gap-4">
            {preview.image && (
              <img
                src={preview.image}
                alt="preview"
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate">{preview.title}</h3>
              <p className="text-sm text-gray-300 line-clamp-2">{preview.description}</p>
              <div className="mt-1 text-xs text-gray-400 truncate">{longUrl}</div>
            </div>
          </div>
        </div>
      )}

      {/* Short URL Result */}
      {shortUrl && (
        <div className="mt-6 space-y-4 animate-fadeIn">
          <div className="p-4 bg-gray-800/70 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between gap-2">
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-400 mb-1">Short URL</p>
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-medium truncate block"
                >
                  {shortUrl}
                </a>
              </div>
              <button
                onClick={copyToClipboard}
                className="flex-shrink-0 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition duration-200"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {expiresAt && (
              <div className="mt-3 flex items-center text-sm text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Expires: {new Date(expiresAt).toLocaleString()}
              </div>
            )}
          </div>

          {/* QR Code */}
          {qrCode && (
            <div className="p-4 bg-gray-800/70 rounded-lg border border-gray-700 text-center">
              <h3 className="text-lg font-medium text-white mb-3">QR Code</h3>
              <div className="p-2 bg-white rounded-lg inline-block">
                <img src={qrCode} alt="QR Code" className="w-40 h-40" />
              </div>
              <div className="mt-4">
                <a
                  href={qrCode}
                  download="qrcode.png"
                  className="inline-flex no-underline items-center px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-lg font-medium transition duration-200 shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download QR Code
                </a>
              </div>
            </div>
          )}
        </div>
      )}
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}