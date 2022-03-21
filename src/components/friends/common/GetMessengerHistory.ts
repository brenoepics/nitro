import { IChatEntry } from '../../chat-history/common/IChatEntry';

const GLOBAL_MESSENGER_CHATS: IChatEntry[] = [];
const CHAT_HISTORY_MAX = 1000;

export const GetMessengerHistory = () => GLOBAL_MESSENGER_CHATS; 

export const AddMessengerChatEntry = (entry: IChatEntry) =>
{
    entry.id = GLOBAL_MESSENGER_CHATS.length;
        
    GLOBAL_MESSENGER_CHATS.push(entry);

    //check for overflow
    if(GLOBAL_MESSENGER_CHATS.length > CHAT_HISTORY_MAX)
    {
        GLOBAL_MESSENGER_CHATS.shift();
    }
}
