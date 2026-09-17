import React, { useState, useEffect } from "react";
import {
  Cog6ToothIcon,
  PlusIcon,
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import settingsApi from "../../api/settings.api";
import { useToast } from "../../context/ToastContext";

const DEFAULT_PRODUCT_TABS = {
  description: { enabled: true, label: "DESCRIPTION" },
  details: { enabled: true, label: "DETAILS" },
  reviews: { enabled: true, label: "REVIEWS" },
};

// Must stay in sync with the icon enum on the Settings model and the
// ICONS map in the storefront Services component.
const SERVICE_ICONS = [
  "diamond",
  "lock",
  "truck",
  "people",
  "shield",
  "gift",
  "star",
  "headset",
];

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
    productTabs: { ...DEFAULT_PRODUCT_TABS },
    serviceHighlights: [],
    serviceHighlightsEnabled: true,
    faqs: [],
    faqTitle: "FAQ",
    faqsEnabled: true,
    aboutJourney: { heading: "Our Journey", paragraphs: [], enabled: true },
    aboutCraftsmanship: { heading: "", intro: "", blocks: [], enabled: true },
    aboutValues: { heading: "Company Values", items: [], enabled: true },
    aboutCta: { heading: "", subtext: "", buttonText: "", buttonLink: "/contact", enabled: true },
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
        productTabs: {
          ...DEFAULT_PRODUCT_TABS,
          ...(data.productTabs || {}),
        },
        serviceHighlights: data.serviceHighlights ?? [],
        serviceHighlightsEnabled: data.serviceHighlightsEnabled ?? true,
        faqs: data.faqs ?? [],
        faqTitle: data.faqTitle ?? "FAQ",
        faqsEnabled: data.faqsEnabled ?? true,
        aboutJourney: data.aboutJourney ?? { heading: "Our Journey", paragraphs: [], enabled: true },
        aboutCraftsmanship: data.aboutCraftsmanship ?? { heading: "", intro: "", blocks: [], enabled: true },
        aboutValues: data.aboutValues ?? { heading: "Company Values", items: [], enabled: true },
        aboutCta: data.aboutCta ?? { heading: "", subtext: "", buttonText: "", buttonLink: "/contact", enabled: true },
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

  const updateJourneyParagraph = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      aboutJourney: {
        ...prev.aboutJourney,
        paragraphs: prev.aboutJourney.paragraphs.map((p, i) => (i === index ? value : p)),
      },
    }));
  };

  const updateValueItem = (index, patch) => {
    setFormData((prev) => ({
      ...prev,
      aboutValues: {
        ...prev.aboutValues,
        items: prev.aboutValues.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
      },
    }));
  };

  const updateCraftBlock = (index, patch) => {
    setFormData((prev) => ({
      ...prev,
      aboutCraftsmanship: {
        ...prev.aboutCraftsmanship,
        blocks: prev.aboutCraftsmanship.blocks.map((b, i) =>
          i === index ? { ...b, ...patch } : b
        ),
      },
    }));
  };

  const updateServiceItem = (index, patch) => {
    setFormData((prev) => ({
      ...prev,
      serviceHighlights: prev.serviceHighlights.map((it, i) =>
        i === index ? { ...it, ...patch } : it
      ),
    }));
  };

  const updateFaqItem = (index, patch) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    }));
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
        productTabs: formData.productTabs,
        serviceHighlights: formData.serviceHighlights,
        serviceHighlightsEnabled: formData.serviceHighlightsEnabled,
        faqs: formData.faqs,
        faqTitle: formData.faqTitle,
        faqsEnabled: formData.faqsEnabled,
        aboutJourney: formData.aboutJourney,
        aboutCraftsmanship: formData.aboutCraftsmanship,
        aboutValues: formData.aboutValues,
        aboutCta: formData.aboutCta,
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

          {/* Product page tabs */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Product page tabs</h2>
            <p className="text-sm text-gray-500 mt-1">
              Show, hide or rename the tabs on the storefront product page.
              Description stays visible so the page always has content.
            </p>

            <div className="mt-4 space-y-3">
              {[
                { key: "description", locked: true },
                { key: "details", locked: false },
                { key: "reviews", locked: false },
              ].map(({ key, locked }) => {
                const tab = formData.productTabs?.[key] || DEFAULT_PRODUCT_TABS[key];
                return (
                  <div
                    key={key}
                    className="flex flex-wrap items-center gap-3 border border-gray-100 rounded-lg p-3"
                  >
                    <label className="flex items-center gap-2 min-w-[110px]">
                      <input
                        type="checkbox"
                        checked={tab.enabled !== false}
                        disabled={locked}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            productTabs: {
                              ...prev.productTabs,
                              [key]: { ...tab, enabled: e.target.checked },
                            },
                          }))
                        }
                        className="w-4 h-4 disabled:opacity-40"
                      />
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {key}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={tab.label ?? ""}
                      maxLength={30}
                      placeholder={DEFAULT_PRODUCT_TABS[key].label}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          productTabs: {
                            ...prev.productTabs,
                            [key]: { ...tab, label: e.target.value },
                          },
                        }))
                      }
                      className="flex-1 min-w-[160px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    {locked && (
                      <span className="text-xs text-gray-400">always shown</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Homepage services strip */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-gray-900">
                Homepage Services
              </h2>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={formData.serviceHighlightsEnabled}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      serviceHighlightsEnabled: e.target.checked,
                    }))
                  }
                />
                Show section
              </label>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              The four-icon strip on the homepage. Text and icon are editable.
            </p>

            <div className="space-y-3">
              {(formData.serviceHighlights || []).map((item, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-3 space-y-2"
                >
                  <div className="flex flex-wrap gap-2 items-center">
                    <select
                      value={item.icon || "diamond"}
                      onChange={(e) => updateServiceItem(i, { icon: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      {SERVICE_ICONS.map((ic) => (
                        <option key={ic} value={ic}>
                          {ic}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={item.title || ""}
                      onChange={(e) => updateServiceItem(i, { title: e.target.value })}
                      placeholder="Title"
                      maxLength={60}
                      className="flex-1 min-w-[160px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <label className="flex items-center gap-1 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={item.enabled !== false}
                        onChange={(e) => updateServiceItem(i, { enabled: e.target.checked })}
                      />
                      Visible
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          serviceHighlights: prev.serviceHighlights.filter((_, idx) => idx !== i),
                        }))
                      }
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.subtitle || ""}
                    onChange={(e) => updateServiceItem(i, { subtitle: e.target.value })}
                    placeholder="Subtitle"
                    maxLength={120}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  serviceHighlights: [
                    ...(prev.serviceHighlights || []),
                    {
                      icon: "diamond",
                      title: "",
                      subtitle: "",
                      enabled: true,
                      displayOrder: (prev.serviceHighlights?.length || 0) + 1,
                    },
                  ],
                }))
              }
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              + Add service
            </button>
          </div>

          {/* Homepage FAQ */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-gray-900">Homepage FAQ</h2>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={formData.faqsEnabled}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, faqsEnabled: e.target.checked }))
                  }
                />
                Show section
              </label>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Questions shown in the homepage accordion.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section heading
            </label>
            <input
              type="text"
              value={formData.faqTitle}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, faqTitle: e.target.value }))
              }
              maxLength={80}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4"
            />

            <div className="space-y-3">
              {(formData.faqs || []).map((item, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={item.question || ""}
                      onChange={(e) => updateFaqItem(i, { question: e.target.value })}
                      placeholder="Question"
                      maxLength={300}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <label className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={item.enabled !== false}
                        onChange={(e) => updateFaqItem(i, { enabled: e.target.checked })}
                      />
                      Visible
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          faqs: prev.faqs.filter((_, idx) => idx !== i),
                        }))
                      }
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={item.answer || ""}
                    onChange={(e) => updateFaqItem(i, { answer: e.target.value })}
                    placeholder="Answer"
                    rows={3}
                    maxLength={2000}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  faqs: [
                    ...(prev.faqs || []),
                    {
                      question: "",
                      answer: "",
                      enabled: true,
                      displayOrder: (prev.faqs?.length || 0) + 1,
                    },
                  ],
                }))
              }
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              + Add question
            </button>
          </div>

          {/* About page — Our Journey */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-gray-900">
                About Page — Our Journey
              </h2>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={formData.aboutJourney?.enabled !== false}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      aboutJourney: { ...prev.aboutJourney, enabled: e.target.checked },
                    }))
                  }
                />
                Show section
              </label>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Heading sits on the left, paragraphs on the right. No imagery.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
            <input
              type="text"
              value={formData.aboutJourney?.heading || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  aboutJourney: { ...prev.aboutJourney, heading: e.target.value },
                }))
              }
              maxLength={120}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4"
            />

            <div className="space-y-3">
              {(formData.aboutJourney?.paragraphs || []).map((para, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <textarea
                    value={para}
                    onChange={(e) => updateJourneyParagraph(i, e.target.value)}
                    rows={4}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        aboutJourney: {
                          ...prev.aboutJourney,
                          paragraphs: prev.aboutJourney.paragraphs.filter((_, idx) => idx !== i),
                        },
                      }))
                    }
                    className="text-xs text-red-600 hover:underline mt-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  aboutJourney: {
                    ...prev.aboutJourney,
                    paragraphs: [...(prev.aboutJourney?.paragraphs || []), ""],
                  },
                }))
              }
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              + Add paragraph
            </button>
          </div>

          {/* About page — Craftsmanship */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-gray-900">
                About Page — Craftsmanship
              </h2>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={formData.aboutCraftsmanship?.enabled !== false}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      aboutCraftsmanship: {
                        ...prev.aboutCraftsmanship,
                        enabled: e.target.checked,
                      },
                    }))
                  }
                />
                Show section
              </label>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Each block has an optional bold label above its paragraph.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
            <input
              type="text"
              value={formData.aboutCraftsmanship?.heading || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  aboutCraftsmanship: { ...prev.aboutCraftsmanship, heading: e.target.value },
                }))
              }
              maxLength={120}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intro paragraph
            </label>
            <textarea
              value={formData.aboutCraftsmanship?.intro || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  aboutCraftsmanship: { ...prev.aboutCraftsmanship, intro: e.target.value },
                }))
              }
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4"
            />

            <div className="space-y-3">
              {(formData.aboutCraftsmanship?.blocks || []).map((block, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={block.label || ""}
                      onChange={(e) => updateCraftBlock(i, { label: e.target.value })}
                      placeholder="Label (e.g. The Artisans:)"
                      maxLength={120}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          aboutCraftsmanship: {
                            ...prev.aboutCraftsmanship,
                            blocks: prev.aboutCraftsmanship.blocks.filter((_, idx) => idx !== i),
                          },
                        }))
                      }
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={block.body || ""}
                    onChange={(e) => updateCraftBlock(i, { body: e.target.value })}
                    placeholder="Body"
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  aboutCraftsmanship: {
                    ...prev.aboutCraftsmanship,
                    blocks: [...(prev.aboutCraftsmanship?.blocks || []), { label: "", body: "" }],
                  },
                }))
              }
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              + Add block
            </button>
          </div>

          {/* About page — Company Values */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-gray-900">
                About Page — Company Values
              </h2>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={formData.aboutValues?.enabled !== false}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      aboutValues: { ...prev.aboutValues, enabled: e.target.checked },
                    }))
                  }
                />
                Show section
              </label>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Each value renders with a gold accent bar on its left.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
            <input
              type="text"
              value={formData.aboutValues?.heading || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  aboutValues: { ...prev.aboutValues, heading: e.target.value },
                }))
              }
              maxLength={120}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4"
            />

            <div className="space-y-3">
              {(formData.aboutValues?.items || []).map((item, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={item.title || ""}
                      onChange={(e) => updateValueItem(i, { title: e.target.value })}
                      placeholder="Title (e.g. Excellence)"
                      maxLength={120}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          aboutValues: {
                            ...prev.aboutValues,
                            items: prev.aboutValues.items.filter((_, idx) => idx !== i),
                          },
                        }))
                      }
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={item.body || ""}
                    onChange={(e) => updateValueItem(i, { body: e.target.value })}
                    placeholder="Description"
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  aboutValues: {
                    ...prev.aboutValues,
                    items: [...(prev.aboutValues?.items || []), { title: "", body: "" }],
                  },
                }))
              }
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              + Add value
            </button>
          </div>

          {/* About page — closing CTA */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-gray-900">
                About Page — Closing CTA
              </h2>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={formData.aboutCta?.enabled !== false}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      aboutCta: { ...prev.aboutCta, enabled: e.target.checked },
                    }))
                  }
                />
                Show section
              </label>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              The final call-to-action at the bottom of the About page.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
                <input
                  type="text"
                  value={formData.aboutCta?.heading || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      aboutCta: { ...prev.aboutCta, heading: e.target.value },
                    }))
                  }
                  maxLength={160}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtext (optional)
                </label>
                <input
                  type="text"
                  value={formData.aboutCta?.subtext || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      aboutCta: { ...prev.aboutCta, subtext: e.target.value },
                    }))
                  }
                  maxLength={400}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button text
                </label>
                <input
                  type="text"
                  value={formData.aboutCta?.buttonText || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      aboutCta: { ...prev.aboutCta, buttonText: e.target.value },
                    }))
                  }
                  maxLength={60}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button link
                </label>
                <input
                  type="text"
                  value={formData.aboutCta?.buttonLink || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      aboutCta: { ...prev.aboutCta, buttonLink: e.target.value },
                    }))
                  }
                  maxLength={300}
                  placeholder="/contact"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
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
