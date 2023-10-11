import { useUserStore } from "@/stores/userStore";
import { useEffect, useState } from "react";

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
      <div className="w-8 h-8 rounded-full bg-white border-primary-100 border-2" />
      <p className="text-xs">{userDisplayName}</p>
    </div>
  );
};

export default UserBox;
