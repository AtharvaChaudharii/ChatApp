import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import {
  GET_ALL_MESSAGES_ROUTE,
  GET_CHANNEL_MESSAGES,
  HOST,
} from "@/utils/constants";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "@/lib/utils";
import { languages } from "@/utils/languages";
import { useSocket } from "@/context/Socketcontext";

const MessageContainer = () => {
  const scrollRef = useRef();
  const socket = useSocket();
  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    selectedChatMessages,
    setSelectedChatMessages,
    setFileDownloadProgress,
    setIsDownloading,
  } = useAppStore();

  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTE,
          { id: selectedChatData._id },
          { withCredentials: true }
        );
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log({ error });
      }
    };

    const getChannelMessages = async () => {
      try {
        const response = await apiClient.get(
          `${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`,
          { withCredentials: true }
        );
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log({ error });
      }
    };

    if (selectedChatData._id) {
      if (selectedChatType === "contact") getMessages();
      else if (selectedChatType === "channel") getChannelMessages();
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  useEffect(() => {
    if (!socket) return;
    console.log(
      "Message container mounted - translation events are handled in socket context"
    );
    return () => {
      console.log("Message container unmounted");
    };
  }, [socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  const checkIfImage = (filePath) => {
    const imageRegex =
      /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message)}
          {selectedChatType === "channel" && renderChannelMessages(message)}
        </div>
      );
    });
  };

  const downloadFile = async (url) => {
    setIsDownloading(true);
    setFileDownloadProgress(0);

    try {
      const response = await apiClient.get(`${HOST}/${url}`, {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          if (total) {
            const percentCompleted = Math.round((loaded * 100) / total);
            setFileDownloadProgress(percentCompleted);
          }
        },
      });

      if (response.status === 200) {
        const urlBlob = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = urlBlob;
        link.setAttribute("download", url.split("/").pop());
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(urlBlob);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setIsDownloading(false);
      setFileDownloadProgress(0);
    }
  };

  const renderDMMessages = (message) => {
    return (
      <div
        className={`${
          (message.sender?._id || message.sender) === userInfo.id
            ? "text-right"
            : "text-left"
        }`}
      >
        {message.messageType === "text" && (
          <div
            className={`relative ${
              (message.sender?._id || message.sender) === userInfo.id
                ? "bg-[#6a11cb]/20 text-white border-[#a16eff]/40 ml-auto"
                : "bg-[#2b2d42]/60 text-[#e0e0e0] border-white/30 mr-auto"
            } border p-4 rounded my-1 max-w-[70%] w-fit break-words`}
          >
            <p className="whitespace-pre-line break-words text-left">
              {message.content}
            </p>
          </div>
        )}

        {message.messageType === "file" && (
          <div
            className={`border inline-block p-4 rounded my-1 max-w-[50%] break-words ${
              message.sender === userInfo.id
                ? "bg-[#6a11cb]/20 text-white border-[#a16eff]/40"
                : "bg-[#2b2d42]/60 text-[#e0e0e0] border-white/30"
            }`}
          >
            {checkIfImage(message.fileUrl) ? (
              <div
                className="cursor-pointer flex justify-center items-center"
                onClick={() => {
                  setShowImage(true);
                  setImageURL(message.fileUrl);
                }}
              >
                <img
                  src={`${HOST}/${message.fileUrl}`}
                  height={250}
                  width={250}
                  className="rounded-lg"
                />
              </div>
            ) : (
              <div className="h-auto w-auto flex items-center justify-center gap-5 ">
                <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3 ">
                  <MdFolderZip />
                </span>
                <span>{message.fileUrl.split("/").pop()}</span>
                <span
                  className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                  onClick={() => downloadFile(message.fileUrl)}
                >
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}
        <div className="text-xs text-gray-500">
          {moment(message.timestamp).format("LT")}
        </div>
      </div>
    );
  };

  const renderChannelMessages = (message) => {
    return (
      <div
        className={`mt-5 ${
          message.sender._id === userInfo.id ? "text-right" : "text-left"
        }`}
      >
        {message.messageType === "text" && (
          <div
            className={`border p-4 rounded my-1 max-w-[70%] w-fit break-words relative ${
              message.sender._id === userInfo.id
                ? "bg-[#6a11cb]/20 text-white border-[#a16eff]/40 ml-auto"
                : "bg-[#2b2d42]/60 text-[#e0e0e0] border-white/30 mr-auto"
            }`}
          >
            <p className="whitespace-pre-line break-words text-left">
              {message.content}
            </p>
          </div>
        )}

        {message.messageType === "file" && (
          <div
            className={`border inline-block p-4 rounded my-1 max-w-[50%] break-words ${
              message.sender._id === userInfo.id
                ? "bg-[#6a11cb]/20 text-white border-[#a16eff]/40"
                : "bg-[#2b2d42]/60 text-[#e0e0e0] border-white/30"
            }`}
          >
            {checkIfImage(message.fileUrl) ? (
              <div
                className="cursor-pointer flex justify-center items-center"
                onClick={() => {
                  setShowImage(true);
                  setImageURL(message.fileUrl);
                }}
              >
                <img
                  src={`${HOST}/${message.fileUrl}`}
                  height={250}
                  width={250}
                  className="rounded-lg"
                />
              </div>
            ) : (
              <div className="h-auto w-auto flex items-center justify-center gap-5 ">
                <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3 ">
                  <MdFolderZip />
                </span>
                <span>{message.fileUrl.split("/").pop()}</span>
                <span
                  className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                  onClick={() => downloadFile(message.fileUrl)}
                >
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}
        {message.sender._id !== userInfo.id ? (
          <div className="mt-1 ml-0 flex items-center justify-start gap-3">
            <Avatar className="h-8 w-8 rounded-full overflow-hidden">
              {message.sender.image && (
                <AvatarImage
                  src={`${HOST}/${message.sender.image}`}
                  alt="profile"
                  className="object-cover w-full h-full bg-black"
                />
              )}
              <AvatarFallback
                className={`uppercase h-8 w-8 text-lg flex items-center justify-center rounded-full ${getColor(
                  message.sender.color
                )}`}
              >
                {message.sender.firstName
                  ? message.sender.firstName.split("").shift()
                  : message.sender.email.split("").shift()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-white/60">
              {`${message.sender.firstName} ${message.sender.lastName}`}
            </span>
            <span className="text-xs text-white/60 ">
              {moment(message.timestamp).format("LT")}
            </span>
          </div>
        ) : (
          <div className="text-xs text-white/60 mt-1">
            {moment(message.timestamp).format("LT")}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 scrollbar-thin overflow-y-auto overflow-x-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
      {renderMessages()}
      <div ref={scrollRef} />
      {showImage && (
        <div
          className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col"
          onClick={() => {
            setShowImage(false);
            setImageURL(null);
          }}
        >
          {/* Image Container (Prevents Closing When Clicking on Image) */}
          <div onClick={(e) => e.stopPropagation()}>
            <img
              src={`${HOST}/${imageURL}`}
              className="h-[80vh] max-w-[80vw] object-contain rounded-lg"
              alt="Preview"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-5 absolute top-5 right-5">
            <button
              className="bg-black p-3 text-4xl rounded-full cursor-pointer transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation(); // Prevents popup from closing when clicking the button
                downloadFile(imageURL);
              }}
            >
              <IoMdArrowRoundDown />
            </button>
            <button
              className="bg-black p-3 text-4xl rounded-full cursor-pointer transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                setShowImage(false);
                setImageURL(null);
              }}
            >
              <IoCloseSharp />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
