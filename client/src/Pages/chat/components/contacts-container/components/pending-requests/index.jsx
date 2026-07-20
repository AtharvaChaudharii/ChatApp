import { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api-client";
import {
  GET_FRIEND_REQUESTS_ROUTE,
  ACCEPT_FRIEND_REQUEST_ROUTE,
  REJECT_FRIEND_REQUEST_ROUTE,
  GET_CHANNEL_INVITES_ROUTE,
  ACCEPT_CHANNEL_INVITE_ROUTE,
  REJECT_CHANNEL_INVITE_ROUTE,
  HOST,
} from "@/utils/constants";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store";

const PendingRequests = () => {
  const [open, setOpen] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [channelInvites, setChannelInvites] = useState([]);
  const { addChannel } = useAppStore();

  const fetchRequests = async () => {
    try {
      const [friendsRes, channelsRes] = await Promise.all([
        apiClient.get(GET_FRIEND_REQUESTS_ROUTE, { withCredentials: true }),
        apiClient.get(GET_CHANNEL_INVITES_ROUTE, { withCredentials: true })
      ]);

      if (friendsRes.data.incoming) {
        setFriendRequests(friendsRes.data.incoming);
      }
      if (channelsRes.data.channels) {
        setChannelInvites(channelsRes.data.channels);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (open) {
      fetchRequests();
    }
  }, [open]);

  const handleFriendRequest = async (targetId, accept) => {
    try {
      const route = accept ? ACCEPT_FRIEND_REQUEST_ROUTE : REJECT_FRIEND_REQUEST_ROUTE;
      await apiClient.post(route, { targetId }, { withCredentials: true });
      setFriendRequests(prev => prev.filter(req => req._id !== targetId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleChannelInvite = async (channelId, accept) => {
    try {
      const route = accept ? ACCEPT_CHANNEL_INVITE_ROUTE : REJECT_CHANNEL_INVITE_ROUTE;
      const res = await apiClient.post(route, { channelId }, { withCredentials: true });
      setChannelInvites(prev => prev.filter(inv => inv._id !== channelId));
      if (accept && res.data.channel) {
        addChannel(res.data.channel);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const totalRequests = friendRequests.length + channelInvites.length;

  return (
    <>
      <div 
        className="relative cursor-pointer text-neutral-400 hover:text-white transition-all p-2"
        onClick={() => setOpen(true)}
      >
        <FaBell className="text-xl" />
        {totalRequests > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
            {totalRequests}
          </span>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#181920] border-none text-white w-[90vw] max-w-[400px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Pending Requests</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 overflow-y-auto pr-2 mt-4">
            
            {friendRequests.length === 0 && channelInvites.length === 0 && (
              <p className="text-center text-gray-500 mt-10">No pending requests.</p>
            )}

            {friendRequests.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-3">Friend Requests</h3>
                <div className="flex flex-col gap-3">
                  {friendRequests.map((req) => (
                    <div key={req._id} className="flex justify-between items-center bg-[#2c2e3b] p-3 rounded-lg">
                      <div className="flex gap-3 items-center">
                        <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                          {req.image ? (
                            <AvatarImage src={`${HOST}/${req.image}`} className="object-cover w-full h-full bg-black" />
                          ) : (
                            <div className={`uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(req.color)}`}>
                              {req.firstName ? req.firstName.charAt(0) : req.email.charAt(0)}
                            </div>
                          )}
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{req.firstName ? `${req.firstName} ${req.lastName}` : req.email}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleFriendRequest(req._id, true)} className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded">Accept</button>
                        <button onClick={() => handleFriendRequest(req._id, false)} className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {channelInvites.length > 0 && (
              <div>
                <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-3">Channel Invites</h3>
                <div className="flex flex-col gap-3">
                  {channelInvites.map((channel) => (
                    <div key={channel._id} className="flex justify-between items-center bg-[#2c2e3b] p-3 rounded-lg">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium"># {channel.name}</span>
                        <span className="text-xs text-gray-400">Invited by: {channel.admin.firstName}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleChannelInvite(channel._id, true)} className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded">Accept</button>
                        <button onClick={() => handleChannelInvite(channel._id, false)} className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PendingRequests;
