import { useEffect, useState } from "react";

import { useUserStore } from "@/stores/userStore";

interface UserBoxProps {}

const UserBox = (props: UserBoxProps) => {
  const { xUserId } = useUserStore();
  const [userDisplayName, setUserDisplayName] = useState<string>();

  useEffect(() => {
    if (xUserId) {
      setUserDisplayName(`User ${xUserId?.split("-").slice(-1)[0]}`);
    }
  }, [xUserId]);

  return (
    <div className="p-0.5 flex items-center gap-2 pt-6">
      <div className="w-8 h-8 rounded-full bg-white border-primary-100 border-2 flex justify-center items-center text-primary-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      </div>
      <p className="text-xs">{userDisplayName}</p>
    </div>
  );
};

export default UserBox;
