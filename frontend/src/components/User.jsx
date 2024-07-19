import { useEffect, useState } from "react";
import { Button } from "./Button";
import axios from "axios";
import { FiSearch } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:5000/api/v1/user/all?filter=" + filter, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUsers(response.data.users);
        setLoading(false);
      })
      .catch((error) => {
        setError("Error fetching users");
        setLoading(false);
        console.error("Error fetching users:", error);
      });
  }, [filter]);

  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="font-bold text-2xl mb-4">Users</div>
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full px-4 py-2 border rounded border-gray-300 focus:outline-none focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FiSearch className="absolute right-3 top-3 text-gray-400" />
      </div>
      <div className="border-solid border-2 border-gray-200 rounded max-h-96 overflow-y-auto mt-4">
        {loading ? (
          <div className="text-center py-4">
            <AiOutlineLoading3Quarters className="animate-spin text-2xl text-blue-500 mx-auto" />
            Loading...
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => <User key={user.id} user={user} />)
        ) : (
          <div className="text-center py-4">No users found</div>
        )}
      </div>
    </div>
  );
};

function User({ user }) {
  const navigate = useNavigate();
  return (
    <div className="flex justify-between items-center border-b border-gray-200 p-4 hover:bg-gray-50 transition">
      <div className="flex items-center">
        <div className="rounded-full h-12 w-12 bg-blue-500 text-white flex justify-center items-center text-xl mr-4">
          {user.firstName[0]}
        </div>
        <div className="text-gray-700">
          <div className="font-medium">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      </div>
      <div>
        <Button
          onClick={() =>
            navigate("/send?id=" + user._id + "&name=" + user.firstName)
          }
          label={"Send Money"}
        />
      </div>
    </div>
  );
}
