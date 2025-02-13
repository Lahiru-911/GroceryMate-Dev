import React, { useState, useEffect } from "react";
import { database } from "../config/firebaseConfig";
import { auth } from "../config/firebaseConfig";
import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  push,
} from "firebase/database";
import Countdown from "../Components/Countdown/Countdown";
import { onAuthStateChanged } from "firebase/auth";

const Inventory = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(""); // Store display name
  const [groceryList, setGroceryList] = useState([]);
  const [newItem, setNewItem] = useState({
    item: "",
    category: "",
    quantity: 1,
  });
  const [showAllGroceries, setShowAllGroceries] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    // Listen for authentication state changes
    onAuthStateChanged(auth, (loggedUser) => {
      if (loggedUser) {
        setUser(loggedUser);
        setUsername(loggedUser.displayName || "User"); // Store display name or fallback
        fetchUserGroceryList(loggedUser.uid);
      } else {
        setUser(null);
        setUsername("");
        setGroceryList([]);
      }
    });
  }, []);

  const fetchUserGroceryList = (userId) => {
    const groceryRef = ref(database, `users/${userId}/groceryList`);
    onValue(groceryRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loadedItems = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setGroceryList(loadedItems);
      } else {
        setGroceryList([]);
      }
    });
  };

  const addItem = () => {
    if (!newItem.item || !newItem.category) return alert("Fill all fields!");
    if (!user) return alert("Please log in to add items.");

    const newItemRef = push(ref(database, `users/${user.uid}/groceryList`));
    set(newItemRef, {
      item: newItem.item,
      category: newItem.category,
      quantity: newItem.quantity,
      status: newItem.quantity > 3 ? "In Stock" : "Low Stock",
    });
    setNewItem({ item: "", category: "", quantity: 1 });
  };

  const deleteItem = (id) => {
    if (!user) return alert("Please log in to delete items.");
    remove(ref(database, `users/${user.uid}/groceryList/${id}`));
  };

  const defaultRows = 5;

  const [showAllRunOutItems, setShowAllRunOutItems] = useState(false);

  const handleReorderAll = async () => {
    const itemsToReorder = groceryList
      .filter((grocery) => grocery.quantity <= 3)
      .map(({ item, category }) => ({ item, category })); // Only keep item & category
  
    if (itemsToReorder.length === 0) {
      alert("No items need to be reordered.");
      return;
    }
  
    const formData = new FormData();
    formData.append("access_key", "c647e414-ceb2-421d-912a-af9c3233e50c"); // Replace with your Web3Forms key
    formData.append("subject", "Reorder Items Request");
    formData.append("from_name", "GroceryMate");
    formData.append("from_email", "no-reply@grocerymate.com"); // Optional
    formData.append(
      "message",
      itemsToReorder.map(({ item, category }) => `Item: ${item}, Category: ${category}`).join("\n")
    );
  
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
  
      const result = await response.json();
  
      if (result.success) {
        alert("Reorder request sent successfully!");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error submitting reorder:", error);
      alert("Failed to send reorder request.");
    }
  };  
  

  // Update item quantity
  const updateQuantity = (id, newQuantity) => {
    if (!user) return alert("Please log in to update items.");
    if (newQuantity < 0) return;

    update(ref(database, `users/${user.uid}/groceryList/${id}`), {
      quantity: newQuantity,
      status: newQuantity > 3 ? "In Stock" : "Low Stock",
    });
  };

  const [editingId, setEditingId] = useState(null);
  const [editedItem, setEditedItem] = useState({});

  const handleEditClick = (grocery) => {
    setEditingId(grocery.id);
    setEditedItem({ ...grocery });
  };

  const handleChange = (e) => {
    setEditedItem({ ...editedItem, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    updateItem(editedItem);
    setEditingId(null);
  };

  const updateItem = (updatedGrocery) => {
    if (!user) return alert("Please log in to update items.");

    update(
      ref(database, `users/${user.uid}/groceryList/${updatedGrocery.id}`),
      {
        item: updatedGrocery.item,
        category: updatedGrocery.category,
        quantity: updatedGrocery.quantity,
        status: updatedGrocery.quantity > 3 ? "In Stock" : "Low Stock",
      }
    )
      .then(() => {
        setGroceryList((prevList) =>
          prevList.map((item) =>
            item.id === updatedGrocery.id ? updatedGrocery : item
          )
        );
      })
      .catch((error) => {
        console.error("Error updating item:", error);
      });
  };

  return (
    <>
      {user ? (
        <section>
          {/* Greeting Section */}
          <div className="flex flex-col justify-center items-center w-full h-40 shadow-lg bg-[#1b1b1b] text-white text-center">
            <h2 className="text-white font-semibold text-center text-lg sm:text-2xl md:text-3xl lg:text-5xl italic tracking-wide">
              Hi, {user?.displayName || user?.email?.split("@")[0] || "User"} 👋
            </h2>
            <p className="font-semibold text-lg sm:text-2xl md:text-3xl lg:text-5xl italic tracking-wide">
              Welcome to your Inventory Management
            </p>
          </div>

          {/* Add Item Section */}
          <div className="p-5 md:p-10 bg-gray-100 rounded-lg shadow-lg mx-4 my-6">
            <h3 className="text-lg font-semibold mb-4">Add New Item</h3>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Item Name"
                value={newItem.item}
                onChange={(e) =>
                  setNewItem({ ...newItem, item: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                placeholder="Category"
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem({ ...newItem, quantity: parseInt(e.target.value) })
                }
                className="border p-2 rounded w-full"
              />
              <button
                onClick={addItem}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Add Item
              </button>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="overflow-auto md:p-10 bg-[#20cd8d] rounded-lg shadow-lg mx-4 my-6">
            <table className="min-w-full table-auto border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-white text-gray-800 font-semibold text-sm md:text-md lg:text-lg shadow-md">
                  <th className="px-6 py-3 text-left">Item Name</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-center">Quantity</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groceryList.map((grocery) => (
                  <tr
                    key={grocery.id}
                    className="bg-white hover:bg-gray-100 text-gray-700 text-sm md:text-md shadow-sm"
                  >
                    {editingId === grocery.id ? (
                      <>
                        <td className="px-6 py-3">
                          <input
                            type="text"
                            name="item"
                            value={editedItem.item}
                            onChange={handleChange}
                            className="border p-1 w-full"
                          />
                        </td>
                        <td className="px-6 py-3">
                          <input
                            type="text"
                            name="category"
                            value={editedItem.category}
                            onChange={handleChange}
                            className="border p-1 w-full"
                          />
                        </td>
                        <td className="px-6 py-3 text-center">
                          <input
                            type="number"
                            name="quantity"
                            value={editedItem.quantity}
                            onChange={handleChange}
                            className="border p-1 w-full"
                          />
                        </td>
                        <td className="px-6 py-3 text-center font-semibold">
                          {grocery.status}
                        </td>
                        <td className="px-6 py-3 text-center flex justify-center space-x-3">
                          <button
                            onClick={handleUpdate}
                            className="bg-green-500 text-white px-3 py-1 rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-gray-500 text-white px-3 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-3">{grocery.item}</td>
                        <td className="px-6 py-3">{grocery.category}</td>
                        <td className="px-6 py-3 text-center">
                          {grocery.quantity}
                        </td>
                        <td
                          className={`px-6 py-3 text-center font-semibold ${
                            grocery.status === "Low Stock"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {grocery.status}
                        </td>
                        <td className="px-6 py-3 text-center flex justify-center space-x-3">
                          <button
                            onClick={() => handleEditClick(grocery)}
                            className="bg-blue-500 text-white px-3 py-1 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteItem(grocery.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Countdown */}
          <Countdown />
        </section>
      ) : (
        <p className="text-center text-xl mt-10">
          Please log in to access your inventory.
        </p>
      )}

      {/* Current Table */}
      <section>
        <div className="p-5 md:p-10">
          <h2 className="text-black font-light text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl">
            Current Groceries List
          </h2>
          <p className="text-sm sm:text-base md:text-lg xl:text-2xl">
            Manage your grocery items and quantities.
          </p>
        </div>

        {/* Table Section */}
        <div className="overflow-auto md:p-10 bg-[#20cd8d] rounded-lg shadow-lg m-3 mx-1 sm:mx-4 md:mx-8 lg:mx-16 xl:mx-20">
          <table className="min-w-full table-auto border-separate border-spacing-y-2 mt-5">
            <thead>
              <tr className="bg-white text-gray-800 font-semibold text-sm md:text-md lg:text-lg shadow-md">
                <th className="px-6 py-3 text-left">Item Name</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-center">Quantity</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groceryList
                .slice(0, showAllGroceries ? groceryList.length : defaultRows)
                .map((grocery) => (
                  <tr
                    key={grocery.id}
                    className="bg-white hover:bg-gray-100 text-gray-700 text-sm md:text-md shadow-sm rounded-lg"
                  >
                    <td className="px-2 md:px-4 py-1 md:py-2">
                      {grocery.item}
                    </td>
                    <td className="px-2 md:px-4 py-1 md:py-2">
                      {grocery.category}
                    </td>
                    <td className="px-2 md:px-4 py-1 md:py-2 text-center">
                      {grocery.quantity}
                    </td>
                    <td className="px-2 py-1 md:py-2 text-center">
                      <button
                        onClick={() =>
                          updateQuantity(grocery.id, grocery.quantity + 1)
                        }
                        className="w-8 h-8 md:w-12 md:h-12 px-2 py-2 bg-[#1db97f] hover:bg-[#20cd8d] text-white rounded-full m-2 text-sm md:text-lg shadow-md"
                      >
                        +
                      </button>
                      <button
                        onClick={() =>
                          updateQuantity(grocery.id, grocery.quantity - 1)
                        }
                        className="w-8 h-8 md:w-12 md:h-12 px-2 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full m-2 text-sm md:text-lg"
                      >
                        -
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowAllGroceries(!showAllGroceries)}
              className="text-white bg-gray-900 hover:bg-gray-800 rounded-full px-6 py-2 shadow-md"
            >
              {showAllGroceries ? "Show Less" : "See More"}
            </button>
          </div>
        </div>
      </section>

      {/* Run Out Table */}
      <section>
        <div className="p-5 md:p-10 border-t border-gray-800">
          <h2 className="text-black font-light text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl">
            Items About to Run Out
          </h2>
          <p className="text-sm sm:text-base md:text-lg xl:text-2xl">
            Manage your grocery items that need to be reordered soon.
          </p>
        </div>
        {/* Table Section */}
        <div className="overflow-auto md:p-10 bg-[#20cd8d] rounded-lg shadow-lg m-3 mx-1 sm:mx-4 md:mx-8 lg:mx-16 xl:mx-20">
          <table className="min-w-full table-auto border-separate border-spacing-y-2 mt-5">
            <thead>
              <tr className="bg-white text-gray-800 font-semibold text-sm md:text-md lg:text-lg shadow-md">
                <th className="px-6 py-3 text-left">Item Name</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-center">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {groceryList
                .filter((grocery) => grocery.quantity <= 3)
                .slice(
                  0,
                  showAllRunOutItems
                    ? groceryList.filter((grocery) => grocery.quantity <= 1)
                        .length
                    : defaultRows
                )
                .map((grocery) => (
                  <tr
                    key={grocery.id}
                    className="bg-white hover:bg-gray-100 text-gray-700 text-sm md:text-md shadow-sm rounded-lg"
                  >
                    <td className="px-2 md:px-4 py-1 md:py-2">
                      {grocery.item}
                    </td>
                    <td className="px-2 md:px-4 py-1 md:py-2">
                      {grocery.category}
                    </td>
                    <td className="px-2 md:px-4 py-1 md:py-2 text-center">
                      {grocery.quantity}
                    </td>
                   
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setShowAllRunOutItems(!showAllRunOutItems)}
              className="text-white bg-gray-900 hover:bg-gray-800 rounded-full px-6 py-2 shadow-md"
            >
              {showAllRunOutItems ? "Show Less" : "See More"}
            </button>

            <button
              onClick={handleReorderAll}
              className="text-white bg-gray-900 hover:bg-gray-800 rounded-full px-6 py-2 shadow-md"
            >
              Reorder All
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Inventory;
