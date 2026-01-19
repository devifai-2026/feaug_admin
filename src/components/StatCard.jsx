// StatCard.jsx
const StatCard = ({ title, value, change, icon, color }) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          <p className={`mt-1 text-sm ${change?.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {change ? `${change} from last month` : ''}
          </p>
        </div>
        <div className={`${color} rounded-lg p-3`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default StatCard