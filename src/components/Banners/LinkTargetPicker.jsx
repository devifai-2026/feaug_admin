import { useState, useEffect, useMemo } from "react";
import categoryApi from "../../api/categories.api";
import productApi from "../../api/product.api";

/**
 * Link target selector for banners.
 *
 * Admins used to have to paste a raw Mongo ObjectId here. This resolves the
 * options for the chosen linkType and presents them as a searchable dropdown,
 * so the stored value is still the id but nobody has to know it.
 *
 * `url` keeps a plain text input — there is nothing to look up.
 */
const LinkTargetPicker = ({ linkType, value, onChange, error }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    if (linkType === "none" || linkType === "url") {
      // Nothing to look up for these types; clear async state on a later tick
      // so this effect never sets state synchronously during render.
      queueMicrotask(() => {
        if (cancelled) return;
        setOptions([]);
        setLoadError(null);
      });
      return () => {
        cancelled = true;
      };
    }

    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setLoadError(null);
    });

    const fetcher =
      linkType === "product"
        ? productApi
            .getAllProducts({ limit: 500 })
            .then((r) => (r?.data?.products || []).map((p) => ({ id: p._id, label: p.name })))
        : linkType === "category"
        ? categoryApi
            .getAllCategories({ limit: 500 })
            .then((r) => (r?.data?.categories || []).map((c) => ({ id: c._id, label: c.name })))
        : // "collection" has no model of its own; subcategories are the closest
          // real entity, so they are what a collection link can point at.
          categoryApi
            .getAllSubCategories({ limit: 500 })
            .then((r) => (r?.data?.subCategories || r?.data?.subcategories || []).map((s) => ({ id: s._id, label: s.name })));

    fetcher
      .then((opts) => {
        if (cancelled) return;
        setOptions(opts.filter((o) => o.id && o.label));
      })
      .catch(() => {
        if (!cancelled) setLoadError("Could not load options — enter the ID manually.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [linkType]);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  if (linkType === "none") return null;

  const baseInput =
    "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const borderClass = error ? "border-red-500" : "border-gray-300";

  // Custom URL: nothing to resolve, keep the free-text field.
  if (linkType === "url") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Link Target *</label>
        <input
          type="text"
          name="linkTarget"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInput} ${borderClass}`}
          placeholder="https://example.com"
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  const label =
    linkType === "product" ? "Product" : linkType === "category" ? "Category" : "Collection";

  // If the options failed to load, fall back to the manual ID input rather
  // than trapping the admin with an empty dropdown.
  if (loadError) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Link Target *</label>
        <input
          type="text"
          name="linkTarget"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInput} ${borderClass}`}
          placeholder="Enter ID"
        />
        <p className="mt-1 text-sm text-amber-600">{loadError}</p>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select {label} *
      </label>

      {options.length > 8 && (
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${baseInput} border-gray-300 mb-2`}
          placeholder={`Search ${label.toLowerCase()}...`}
        />
      )}

      <select
        name="linkTarget"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className={`${baseInput} ${borderClass} ${loading ? "bg-gray-50 text-gray-400" : ""}`}
      >
        <option value="">
          {loading ? `Loading ${label.toLowerCase()}s...` : `-- Select a ${label.toLowerCase()} --`}
        </option>
        {filtered.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>

      {/* A saved banner may point at something since renamed or deleted, or
          filtered out by the search box — surface it instead of silently
          showing a blank select. */}
      {value && !filtered.some((o) => o.id === value) && !loading && (
        <p className="mt-1 text-xs text-gray-500">
          Current selection: <span className="font-mono">{value}</span>
          {options.some((o) => o.id === value) ? " (hidden by search)" : " (not in list)"}
        </p>
      )}

      {!loading && options.length === 0 && (
        <p className="mt-1 text-sm text-amber-600">
          No {label.toLowerCase()}s found. Create one first.
        </p>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default LinkTargetPicker;
