// StatCard.jsx
const StatCard = ({ title, value, change, icon, color }) => {
  // Replace $ with ₹ in value
  const formatValue = (val) => {
    if (typeof val === 'string') {
      return val.replace(/\$/g, '₹');
    }
    return val;
  };

  const formattedValue = formatValue(value);
  const valueStr = String(formattedValue || '');

  // Determine font size based on value length for responsiveness
  const getFontSize = (str) => {
    if (str.length > 15) return 'text-lg';
    if (str.length > 12) return 'text-xl';
    if (str.length > 9) return 'text-2xl';
    return 'text-3xl';
  };

  const fontSize = getFontSize(valueStr);

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1 mr-3">
          <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
          <p
            className={`mt-2 ${fontSize} font-bold text-gray-900 break-words leading-tight`}
            title={valueStr}
          >
            {formattedValue}
          </p>
          <p className={`mt-1 text-sm ${change?.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {change ? `${change} from last month` : ''}
          </p>
        </div>
        <div className={`${color} rounded-lg p-3 flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default StatCard