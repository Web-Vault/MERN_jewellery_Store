import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';

const WishlistSelector = ({ isOpen, onClose, productId }) => {
    const [wishlists, setWishlists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newWishlistName, setNewWishlistName] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchWishlists();
        }
    }, [isOpen]);

    const fetchWishlists = async () => {
        try {
            const token = localStorage.getItem("userToken");
            const { data } = await axios.get("http://localhost:5000/api/wishlists", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setWishlists(data.wishlists || []);
        } catch (error) {
            setMessage("Failed to fetch wishlists");
        } finally {
            setLoading(false);
        }
    };

    const addToWishlist = async (wishlistId) => {
        try {
            const token = localStorage.getItem("userToken");
            await axios.post(
                `http://localhost:5000/api/wishlists/${wishlistId}/add`,
                { productId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage("✅ Added to wishlist!");
            onClose();
        } catch (error) {
            setMessage("Failed to add to wishlist");
        }
    };

    const createNewWishlist = async () => {
        try {
            const token = localStorage.getItem("userToken");
            const { data } = await axios.post(
                "http://localhost:5000/api/wishlists",
                { name: newWishlistName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setWishlists([...wishlists, data.wishlist]);
            setShowCreateForm(false);
            setNewWishlistName("");
        } catch (error) {
            setMessage("Failed to create wishlist");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-serif text-[#6B4E4D] mb-4">Select Wishlist</h2>
                
                {loading ? (
                    <div className="text-center py-4">Loading wishlists...</div>
                ) : (
                    <div className="space-y-4">
                        {wishlists.map((wishlist) => (
                            <button
                                key={wishlist._id}
                                onClick={() => addToWishlist(wishlist._id)}
                                className="w-full text-left px-4 py-3 rounded-lg hover:bg-[#FAF6F0] transition-colors"
                            >
                                {wishlist.name}
                            </button>
                        ))}
                        
                        {!showCreateForm ? (
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="w-full flex items-center gap-2 text-[#B76E79] px-4 py-3 rounded-lg hover:bg-[#FAF6F0] transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Create New Wishlist
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={newWishlistName}
                                    onChange={(e) => setNewWishlistName(e.target.value)}
                                    placeholder="Enter wishlist name"
                                    className="w-full px-4 py-2 border border-[#E0D6CC] rounded-lg"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowCreateForm(false)}
                                        className="flex-1 px-4 py-2 text-[#6B4E4D] hover:bg-[#FAF6F0] rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={createNewWishlist}
                                        className="flex-1 px-4 py-2 bg-[#B76E79] text-white rounded-lg hover:bg-[#A35D68]"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                <button
                    onClick={onClose}
                    className="mt-6 w-full px-4 py-2 text-[#6B4E4D] hover:bg-[#FAF6F0] rounded-lg"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default WishlistSelector;