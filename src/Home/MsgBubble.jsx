import dayjs from "dayjs";
import { useEffect, useState } from "react";
import socket from "../SocketConfig";

function MsgBubble({ msgObj, userID, setMessages }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editMsg, setEditMsg] = useState(msgObj.decryptedMessage);
  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowMenu(true);
  };

  useEffect(() => {
    socket.on("message_edited", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.id
            ? {
                ...msg,
                iv: data.iv,
                decryptedMessage: data.decryptedMessage,
                edited: true,
              }
            : msg
        )
      );
    });
    return () => socket.off("message_edited");
  }, []);

  const handleEditBtnClick = () => {
    setIsEdit(true);
  };

  const handleClick = () => {
    setShowMenu(false);
  };

  const onSend = () => {
    socket.emit("edit_message", { msgObj, editMsg });

    setIsEdit(false);
  };

  return (
    <div
      className={`w-full flex  justify-${
        msgObj.sender === userID ? "end" : "start"
      } `}
      onClick={handleClick}
    >
      <div
        className=" relative p-3 rounded-xl max-w-[70%] min-w-[50px] break-words flex flex-col justify-center  border border-black m-[5px] "
        onContextMenu={handleContextMenu}
      >
        <p className="text-xs">{msgObj.sender !== userID && msgObj.sender}</p>

        {!isEdit ? (
          <>
            <p>{msgObj.decryptedMessage}</p>
            <div className="min-w-[80px] flex justify-end text-xs gap-2">
              {msgObj.edited && <p>Edited</p>}
              <p>{dayjs(msgObj.sentAt).format("DD/MM/YY hh:mm A")}</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col justify-center items-center gap-[10px]">
            <textarea
              value={editMsg}
              type="text"
              onChange={(e) => {
                setEditMsg(e.target.value);
              }}
              className=" resize-none focus:outline-none w-[95%] p-1 border border-gray-300"
            />
            <div className="flex flex-row justify-center gap-12">
              <button
                className=" w-[100px] border border-black rounded-lg"
                onClick={() => {
                  setIsEdit(false);
                  setEditMsg(msgObj.decryptedMessage);
                }}
              >
                Cancle
              </button>
              <button
                onClick={onSend}
                className=" w-[100px] border border-black rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {showMenu && (
          <div>
            <div
              className="fixed inset-0 bg-transparent z-40"
              onClick={handleClick}
            ></div>

            <div
              className={`absolute ${
                msgObj.sender === userID ? "right-full mr-2" : "left-full ml-2"
              } top-0 ml-2 bg-white border border-black rounded-lg w-32 z-50`}
            >
              <ul className="p-2 space-y-1 text-sm">
                <li className="hover:bg-gray-100 p-1 rounded cursor-pointer">
                  Reply
                </li>
                {msgObj.sender === userID && (
                  <li
                    className="hover:bg-gray-100 p-1 rounded cursor-pointer"
                    onClick={handleEditBtnClick}
                  >
                    Edit
                  </li>
                )}
                <li className="hover:bg-gray-100 p-1 rounded cursor-pointer">
                  Delete
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MsgBubble;
