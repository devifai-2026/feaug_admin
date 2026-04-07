import React, { useState, useEffect } from "react";
import {
  Cog6ToothIcon,
  PlusIcon,
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import settingsApi from "../../api/settings.api";
import { useToast } from "../../context/ToastContext";

const Settings = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPincode, setNewPincode] = useState("");

  const [formData, setFormData] = useState({
    gstRate: "",
    cgstRate: "",
    sgstRate: "",
    freeShippingThreshold: "",
    metroShippingCharge: "",
    standardShippingCharge: "",
    metroPincodes: [],
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.getSettings();
      const data = response.data.settings || response;
      setFormData({
        gstRate: data.gstRate ?? "",
        cgstRate: data.cgstRate ?? "",
        sgstRate: data.sgstRate ?? "",
        freeShippingThreshold: data.freeShippingThreshold ?? "",
        metroShippingCharge: data.metroShippingCharge ?? "",
        standardShippingCharge: data.standardShippingCharge ?? "",
        metroPincodes: data.metroPincodes ?? [],
      });
    } catch (err) {
      console.error("Error fetching settings:", err);
      showToast(err.message || "Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddPincode = () => {
    const trimmed = newPincode.trim();
    if (!trimmed) return;
    if (formData.metroPincodes.includes(trimmed)) {
      showToast("Pincode already exists", "warning");
      return;
    }
    if (!/^\d{6}$/.test(trimmed)) {
      showToast("Please enter a valid 6-digit pincode", "warning");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      metroPincodes: [...prev.metroPincodes, trimmed],
    }));
    setNewPincode("");
  };

  const handleRemovePincode = (pincode) => {
    setFormData((prev) => ({
      ...prev,
      metroPincodes: prev.metroPincodes.filter((p) => p !== pincode),
    }));
  };

  const handlePincodeKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddPincode();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const gstRateValue = Number(formData.gstRate);
      
      // Validate GST Rate
      if (gstRateValue > 18) {
        showToast("GST Rate cannot be more than 18%", "warning");
        setSaving(false);
        return;
      }

      const payload = {
        gstRate: gstRateValue,
        cgstRate: Number(formData.cgstRate),
        sgstRate: Number(formData.sgstRate),
        freeShippingThreshold: Number(formData.freeShippingThreshold),
        metroShippingCharge: Number(formData.metroShippingCharge),
        standardShippingCharge: Number(formData.standardShippingCharge),
        metroPincodes: formData.metroPincodes,
      };
      await settingsApi.updateSettings(payload);
      showToast("Settings saved successfully", "success");
    } catch (err) {
      console.error("Error saving settings:", err);
      showToast(err.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Cog6ToothIcon className="h-5 w-5 text-indigo-600" />
              Settings
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure tax rates, shipping charges, and metro pincodes.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Tax Configuration */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4">
              Tax Configuration
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  GST Rate (%)
                </label>
                <input
                  type="number"
                  name="gstRate"
                  value={formData.gstRate}
                  onChange={handleInputChange}
                  placeholder="e.g. 18"
                  min="0"
                  max="18"
                  step="0.01"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium bg-gray-50/50"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  CGST Rate (%)
                </label>
                <input
                  type="number"
                  name="cgstRate"
                  value={formData.cgstRate}
                  onChange={handleInputChange}
                  placeholder="e.g. 9"
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium bg-gray-50/50"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  SGST Rate (%)
                </label>
                <input
                  type="number"
                  name="sgstRate"
                  value={formData.sgstRate}
                  onChange={handleInputChange}
                  placeholder="e.g. 9"
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium bg-gray-50/50"
                  required
                />
              </div>
            </div>
          </div>

          {/* Shipping Configuration */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4">
              Shipping Configuration
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Free Shipping Threshold (&#8377;)
                </label>
                <input
                  type="number"
                  name="freeShippingThreshold"
                  value={formData.freeShippingThreshold}
                  onChange={handleInputChange}
                  placeholder="e.g. 500"
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium bg-gray-50/50"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Metro Shipping Charge (&#8377;)
                </label>
                <input
                  type="number"
                  name="metroShippingCharge"
                  value={formData.metroShippingCharge}
                  onChange={handleInputChange}
                  placeholder="e.g. 40"
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium bg-gray-50/50"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Standard Shipping Charge (&#8377;)
                </label>
                <input
                  type="number"
                  name="standardShippingCharge"
                  value={formData.standardShippingCharge}
                  onChange={handleInputChange}
                  placeholder="e.g. 70"
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium bg-gray-50/50"
                  required
                />
              </div>
            </div>
          </div>

          {/* Metro Pincodes */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4">
              Metro Pincodes
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Orders delivered to these pincodes will be charged the metro
              shipping rate.
            </p>

            {/* Add Pincode */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newPincode}
                onChange={(e) => setNewPincode(e.target.value)}
                onKeyDown={handlePincodeKeyDown}
                placeholder="Enter 6-digit pincode"
                maxLength={6}
                className="flex-1 max-w-xs px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium bg-gray-50/50"
              />
              <button
                type="button"
                onClick={handleAddPincode}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm active:scale-95"
              >
                <PlusIcon className="h-4 w-4" />
                Add
              </button>
            </div>

            {/* Pincode List */}
            {formData.metroPincodes.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-lg">
                <p className="text-xs text-gray-400">
                  No metro pincodes added yet.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.metroPincodes.map((pincode) => (
                  <div
                    key={pincode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-sm font-medium group"
                  >
                    <span className="font-mono">{pincode}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePincode(pincode)}
                      className="p-0.5 hover:bg-indigo-100 rounded transition-colors"
                      title="Remove pincode"
                    >
                      <XMarkIcon className="h-3.5 w-3.5 text-indigo-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white shadow-md shadow-indigo-100 transition-all active:scale-95"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
