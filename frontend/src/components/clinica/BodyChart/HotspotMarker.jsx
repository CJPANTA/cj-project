export default function HotspotMarker({ x, y, intensidad, onClick }) {
  const color = intensidad <= 3 ? '#22c55e' : intensidad <= 6 ? '#eab308' : '#ef4444';
  return (
    <circle
      cx={x}
      cy={y}
      r={6 + intensidad * 0.5}
      fill={color}
      stroke="white"
      strokeWidth="2"
      opacity="0.8"
      onClick={onClick}
      className="cursor-pointer hover:scale-125 transition-transform"
    />
  );
}