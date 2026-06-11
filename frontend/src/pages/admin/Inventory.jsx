import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';

export default function Inventory() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [distributions, setDistributions] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' or 'history'

  // Forms State
  const [categoryName, setCategoryName] = useState('');
  const [productData, setProductData] = useState({ name: '', category: '', quantity_in_stock: '', unit: 'pcs', purchase_price: '' });
  const [distData, setDistData] = useState({ product: '', distributed_to: '', quantity: '', date: new Date().toISOString().split('T')[0], note: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, prodRes, distRes] = await Promise.all([
        api.get('/inventory/categories/'),
        api.get('/inventory/products/'),
        api.get('/inventory/distributions/')
      ]);
      setCategories(catRes.data);
      setProducts(prodRes.data);
      setDistributions(distRes.data);
    } catch (error) {
      console.error("Error fetching inventory data", error);
    }
  };

  const submitCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/categories/', { name: categoryName });
      setMsg({ type: 'success', text: 'Category added successfully!' });
      setCategoryName('');
      fetchData();
      clearMsg();
    } catch (err) { setMsg({ type: 'error', text: 'Failed to add category.' }); }
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/inventory/products/', productData);
      setMsg({ type: 'success', text: 'Product added to stock successfully!' });
      setProductData({ name: '', category: '', quantity_in_stock: '', unit: 'pcs', purchase_price: '' });
      fetchData();
      clearMsg();
    } catch (err) { setMsg({ type: 'error', text: 'Failed to add product.' }); }
    finally { setIsLoading(false); }
  };

  const submitDistribution = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // চেক করা যে স্টক এনাফ আছে কি না
      const selectedProduct = products.find(p => p.id === distData.product);
      if (selectedProduct && Number(distData.quantity) > selectedProduct.quantity_in_stock) {
        setMsg({ type: 'error', text: `Not enough stock! Only ${selectedProduct.quantity_in_stock} available.` });
        setIsLoading(false);
        return;
      }

      await api.post('/inventory/distributions/', distData);
      setMsg({ type: 'success', text: 'Product distributed successfully!' });
      setDistData({ product: '', distributed_to: '', quantity: '', date: new Date().toISOString().split('T')[0], note: '' });
      fetchData();
      clearMsg();
    } catch (err) { setMsg({ type: 'error', text: 'Failed to record distribution.' }); }
    finally { setIsLoading(false); }
  };

  const clearMsg = () => setTimeout(() => setMsg({ type: '', text: '' }), 3000);

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-brand-deepPlum">Inventory Management</h1>
        <p className="text-gray-500 text-sm mt-1">Track school supplies, lab equipment, and distributions.</p>
      </motion.div>

      {msg.text && (
        <div className={`p-4 rounded-xl font-semibold text-sm ${msg.type === 'success' ? 'bg-brand-mintGreen/30 text-[#0e5c3c]' : 'bg-red-50 text-red-600'}`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Actions & Forms */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Distribute Product Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-brand-tealCyan/30">
            <h2 className="text-lg font-bold text-brand-deepPlum mb-4 border-b pb-2">Distribute Item</h2>
            <form onSubmit={submitDistribution} className="space-y-4">
              <div>
                <label className={labelClass}>Select Product *</label>
                <select required value={distData.product} onChange={(e) => setDistData({...distData, product: e.target.value})} className={inputClass}>
                  <option value="">Select Item...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity_in_stock})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Quantity *</label>
                  <input type="number" min="1" required value={distData.quantity} onChange={(e) => setDistData({...distData, quantity: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Date *</label>
                  <input type="date" required value={distData.date} onChange={(e) => setDistData({...distData, date: e.target.value})} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Distribute To (Class/Person) *</label>
                <input type="text" required placeholder="e.g. Class 10 Science" value={distData.distributed_to} onChange={(e) => setDistData({...distData, distributed_to: e.target.value})} className={inputClass} />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl bg-brand-tealCyan hover:bg-[#4bc2ab] text-brand-deepPlum font-bold transition-colors shadow-md mt-2">
                Record Distribution
              </button>
            </form>
          </motion.div>

          {/* Add New Product Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Add New Product to Stock</h2>
            <form onSubmit={submitProduct} className="space-y-4">
              <div>
                <label className={labelClass}>Product Name *</label>
                <input type="text" required placeholder="e.g. Physics Lab Microscope" value={productData.name} onChange={(e) => setProductData({...productData, name: e.target.value})} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category *</label>
                  <select required value={productData.category} onChange={(e) => setProductData({...productData, category: e.target.value})} className={inputClass}>
                    <option value="">Select...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Unit *</label>
                  <input type="text" required placeholder="e.g. pcs, box" value={productData.unit} onChange={(e) => setProductData({...productData, unit: e.target.value})} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Initial Stock *</label>
                  <input type="number" min="0" required value={productData.quantity_in_stock} onChange={(e) => setProductData({...productData, quantity_in_stock: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Price (৳) *</label>
                  <input type="number" step="0.01" min="0" required value={productData.purchase_price} onChange={(e) => setProductData({...productData, purchase_price: e.target.value})} className={inputClass} />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-900 text-white font-bold transition-colors">
                Add to Stock
              </button>
            </form>
          </motion.div>

          {/* Add Category Form */}
          <div className="bg-[#F5F0FF] p-6 rounded-2xl shadow-sm border border-brand-softLavender/30">
            <h2 className="text-md font-bold text-brand-deepPlum mb-3">Add Category</h2>
            <form onSubmit={submitCategory} className="flex gap-3">
              <input type="text" required placeholder="e.g. Stationery" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className={inputClass} />
              <button type="submit" className="px-6 rounded-xl bg-brand-royalPurple hover:bg-brand-deepPlum text-white font-bold transition-colors">Add</button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: Tables (Tabs for Stock & History) */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit flex flex-col">
          
          <div className="flex border-b border-gray-200">
            <button onClick={() => setActiveTab('stock')} className={`flex-1 py-4 text-center font-bold transition-colors ${activeTab === 'stock' ? 'text-brand-deepPlum border-b-2 border-brand-deepPlum bg-gray-50' : 'text-gray-500 hover:bg-gray-50'}`}>
              📦 Current Stock
            </button>
            <button onClick={() => setActiveTab('history')} className={`flex-1 py-4 text-center font-bold transition-colors ${activeTab === 'history' ? 'text-brand-deepPlum border-b-2 border-brand-deepPlum bg-gray-50' : 'text-gray-500 hover:bg-gray-50'}`}>
              📋 Distribution History
            </button>
          </div>

          <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
            {activeTab === 'stock' ? (
              <table className="w-full text-left border-collapse text-sm min-w-[500px]">
                <thead className="bg-white sticky top-0 shadow-sm text-gray-500">
                  <tr>
                    <th className="p-4 border-b border-gray-100 font-semibold">Product Name</th>
                    <th className="p-4 border-b border-gray-100 font-semibold">Category</th>
                    <th className="p-4 border-b border-gray-100 font-semibold text-center">In Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan="3" className="text-center py-10 text-gray-400 font-semibold">No products in inventory.</td></tr>
                  ) : (
                    products.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                        <td className="p-4 font-bold text-gray-800">{p.name}</td>
                        <td className="p-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">{p.category_name}</td>
                        <td className="p-4 text-center">
                          <span className={`font-bold px-3 py-1 rounded-lg ${p.quantity_in_stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-brand-mintGreen/20 text-[#0e5c3c]'}`}>
                            {p.quantity_in_stock} {p.unit}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse text-sm min-w-[500px]">
                <thead className="bg-white sticky top-0 shadow-sm text-gray-500">
                  <tr>
                    <th className="p-4 border-b border-gray-100 font-semibold">Date</th>
                    <th className="p-4 border-b border-gray-100 font-semibold">Distributed Item</th>
                    <th className="p-4 border-b border-gray-100 font-semibold">Given To</th>
                  </tr>
                </thead>
                <tbody>
                  {distributions.length === 0 ? (
                    <tr><td colSpan="3" className="text-center py-10 text-gray-400 font-semibold">No distributions recorded.</td></tr>
                  ) : (
                    distributions.map(d => (
                      <tr key={d.id} className="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                        <td className="p-4 text-gray-500 font-semibold">{new Date(d.date).toLocaleDateString('en-GB')}</td>
                        <td className="p-4">
                          <span className="font-bold text-brand-deepPlum block">{d.product_name}</span>
                          <span className="text-xs font-bold text-brand-tealCyan">{d.quantity} units</span>
                        </td>
                        <td className="p-4 font-bold text-gray-700">{d.distributed_to}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}