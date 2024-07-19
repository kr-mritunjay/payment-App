import { useLocation } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

export const SendMoney = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const name = searchParams.get("name");

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTransfer = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/v1/account/transfer",
        {
          to: id,
          amount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAmount("");
      alert("Transfer Successful");
    } catch (error) {
      console.error("Error during transfer:", error);
      setError("Transfer failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-gray-800">Send Money</h2>
        </div>
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-3xl text-white">{name[0]}</span>
          </div>
          <h3 className="text-2xl font-semibold text-gray-700">{name}</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-gray-600"
              htmlFor="amount"
            >
              Amount (in Rs)
            </label>
            <input
              onChange={(e) => {
                setAmount(e.target.value);
              }}
              type="number"
              className="flex h-12 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              id="amount"
              placeholder="Enter amount"
              value={amount}
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <button
            onClick={handleTransfer}
            className={`flex justify-center items-center rounded-md text-sm font-medium h-12 px-4 py-2 w-full transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={loading}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Initiate Transfer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
