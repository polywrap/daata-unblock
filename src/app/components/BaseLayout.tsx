"use client";

import useConversations from "@/queries/useConversations";
import dayjs from "dayjs";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useCreateConversation from "@/mutations/useCreateConversation";
import Image from "next/image";
import ChatIcon from "../../../public/chat.svg";
import PolywrapIcon from "../../../public/polywrap.png";
import clsx from "clsx";
import UserBox from "./UserBox";
import { Conversation } from "@/lib/models/conversation";

const BaseLayout = ({ children }: { children: any }) => {
  const { data: conversations } = useConversations();
  const { mutate } = useCreateConversation();
  const { id } = useParams();
  const router = useRouter();

  const sortedConversations = conversations?.sort((a, b) => {
    const aCreatedAt = dayjs(a.createdAt);
    const bCreatedAt = dayjs(b.createdAt);
    return bCreatedAt.diff(aCreatedAt);
  });

  const conversationsByTimeCategory: Record<string, Conversation[]> = {
    today:
      sortedConversations?.filter((conversation) =>
        dayjs(conversation.createdAt).isAfter(dayjs().startOf("day"))
      ) ?? [],
    previous:
      sortedConversations?.filter((conversation) =>
        dayjs(conversation.createdAt).isBefore(dayjs().startOf("day"))
      ) ?? [],
  };

  const onClickNewConversation = () => {
    mutate({});
  };

  return (
    <>
      <div className="h-screen w-screen flex text-primary-900 font-['hdcolton'] overflow-y-hidden">
        <div className="w-80 border-r-2 flex flex-col justify-between p-6 bg-[#EBEBEC] border-[#D2D2D5] overflow-y-hidden">
          <div className="flex flex-col gap-12 overflow-y-hidden">
            <button
              className="px-2 py-2.5 text-sm font-bold bg-white border-primary-100 border-2 rounded-lg text-primary-500 font-['hdcolton-wide']"
              onClick={() => {
                onClickNewConversation();
              }}
            >
              + NEW CHAT
            </button>
            <div className="flex flex-col gap-6 overflow-y-auto">
              {Object.keys(conversationsByTimeCategory).map((key) => (
                <div className="flex-1 flex flex-col gap-2" key={key}>
                  <h3 className="text-xs font-bold text-primary-500 capitalize">
                    {key}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {conversationsByTimeCategory[key].map((conversation) => (
                      <Link
                        key={conversation.id}
                        href={`/conversations/${conversation.id}`}
                      >
                        <div
                          className={clsx(
                            "p-2 flex gap-2 rounded-lg",
                            id === conversation.id
                              ? "border-primary-300 border-2 bg-primary-100 text-primary-500"
                              : ""
                          )}
                        >
                          <Image src={ChatIcon} alt="chat-icon" />
                          <p className="text-xs text-ellipsis overflow-hidden whitespace-nowrap">
                            {conversation.name ?? "New chat"}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t-2 border-primary-300">
            <UserBox />
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="w-full h-20 p-4 flex justify-between items-center border-b-2 bg-[#EBEBEC] border-[#D2D2D5]">
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => {
                router.push("/");
              }}
            >
              <Image src={PolywrapIcon} alt="polywrap-icon" />
              <div className="font-['hdcolton-wide']">
                <h1 className="text-md text-primary-900 font-bold">
                  unblock.ai
                </h1>
                <h2 className="text-[8px] text-primary-500 font-bold">
                  by Polywrap
                </h2>
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
    </>
  );
};

export default BaseLayout;
