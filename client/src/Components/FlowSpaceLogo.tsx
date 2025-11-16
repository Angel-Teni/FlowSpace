export function FlowSpaceLogo() {
  return (
    <svg
      width="180"
      height="180"
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}
    >
      {/* Background Circle */}
      <circle cx="90" cy="90" r="90" fill="white" />
      
      {/* Flowing Wave Design */}
      <path
        d="M45 90C45 78 55 70 65 70C75 70 80 78 90 78C100 78 105 70 115 70C125 70 135 78 135 90"
        stroke="#58A4B0"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      
      <path
        d="M45 100C45 88 55 80 65 80C75 80 80 88 90 88C100 88 105 80 115 80C125 80 135 88 135 100"
        stroke="#B07BAC"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      
      <path
        d="M45 110C45 98 55 90 65 90C75 90 80 98 90 98C100 98 105 90 115 90C125 90 135 98 135 110"
        stroke="#58A4B0"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      
      {/* Stars */}
      <circle cx="70" cy="60" r="2.5" fill="#B07BAC" />
      <circle cx="110" cy="55" r="3" fill="#58A4B0" />
      <circle cx="90" cy="120" r="2" fill="#B07BAC" opacity="0.6" />
    </svg>
  );
}
