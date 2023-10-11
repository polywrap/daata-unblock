import Image from "next/image";
import polywrapSrc from "@/../public/polywrap.png";

const PolywrapAvatar = () => {
  return (
    <Image
      className="w-8 h-8 rounded-full bg-white border-gray-100 border-2"
      src={polywrapSrc}
      alt="Polywrap"
    />
  );
};

export default PolywrapAvatar;
