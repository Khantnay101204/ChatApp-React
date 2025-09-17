import dayjs from "dayjs";
import { useState } from "react";

function MsgBubble({ msg, userID }) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  const handleClick = () => {
    setShowMenu(false);
  };

  return (
    <div
      className={`w-full flex  justify-${
        msg.sender === userID ? "end" : "start"
      } `}
      onClick={handleClick}
    >
      <div
        className=" relative p-3 rounded-xl max-w-[70%] min-w-[50px] break-words flex flex-col justify-center  border border-black m-[5px] "
        onContextMenu={handleContextMenu}
      >
        <p className="text-xs">{msg.sender !== userID && msg.sender}</p>

        <p>{msg.decryptedMessage}</p>
        <div className="min-w-[80px] flex justify-end">
          <p className="text-xs">
            {dayjs(msg.sentAt).format("DD/MM/YY hh:mm A")}
          </p>
        </div>

        {showMenu && (
          <div>
            <div
              className="fixed inset-0 bg-transparent z-40"
              onClick={handleClick}
            ></div>

            <div
              className={`absolute ${
                msg.sender === userID ? "right-full mr-2" : "left-full ml-2"
              } top-0 ml-2 bg-white border border-black rounded-lg w-32 z-50`}
            >
              <ul className="p-2 space-y-1 text-sm">
                <li className="hover:bg-gray-100 p-1 rounded cursor-pointer">
                  Reply
                </li>
                {msg.sender === userID && (
                  <li className="hover:bg-gray-100 p-1 rounded cursor-pointer">
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
