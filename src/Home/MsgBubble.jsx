import dayjs from "dayjs";

function MsgBubble({ msg, userID }) {
  return (
    <div
      className={`w-full flex  justify-${
        msg.sender === userID ? "end" : "start"
      } `}
    >
      <div className="p-3 rounded-xl max-w-[70%] min-w-[50px] break-words flex flex-col justify-center  border border-black m-[5px] ">
        <p className="text-xs">{msg.sender !== userID && msg.sender}</p>

        {msg.decryptedMessage}
        <div className="min-w-[80px] flex justify-end">
          <p className="text-xs">
            {dayjs(msg.sentAt).format("DD/MM/YY hh:mm A")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MsgBubble;
