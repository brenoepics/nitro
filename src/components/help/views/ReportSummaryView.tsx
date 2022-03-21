import { CallForHelpFromForumMessageMessageComposer, CallForHelpFromForumThreadMessageComposer, CallForHelpFromIMMessageComposer, CallForHelpFromPhotoMessageComposer, CallForHelpMessageComposer } from '@nitrots/nitro-renderer';
import { FC } from 'react';
import { CreateLinkEvent, GetSessionDataManager, LocalizeText, SendMessageComposer } from '../../../api';
import { Button, Column, Text } from '../../../common';
import { ReportType } from '../common/ReportType';
import { useHelpContext } from '../HelpContext';

export const ReportSummaryView: FC<{}> = props =>
{
    const { helpReportState = null } = useHelpContext();
    const { reportedChats, cfhTopic, reportedUserId, message, reportType, groupId, messageId, threadId, roomId, extraData, roomObjectId } = helpReportState;
    
    const submitReport = () =>
    {
        const chats: (string | number )[] = [];
        const myUserId = GetSessionDataManager().userId;

        switch(reportType)
        {
            case ReportType.BULLY:
            case ReportType.EMERGENCY:
            case ReportType.ROOM:
                const reportedRoomId = roomId <= 0 ? reportedChats[0].roomId : roomId;

                reportedChats.forEach(entry =>
                {
                    chats.push(entry.entityId);
                    chats.push(entry.message);
                });

                SendMessageComposer(new CallForHelpMessageComposer(message, cfhTopic, reportedUserId, reportedRoomId, chats));
                break;
            case ReportType.IM:
                reportedChats.forEach(entry =>
                {
                    chats.push(entry.entityId);
                    chats.push(entry.message);
                });
                SendMessageComposer(new CallForHelpFromIMMessageComposer(message, cfhTopic, reportedUserId, chats));
                break;
            case ReportType.THREAD:
                SendMessageComposer(new CallForHelpFromForumThreadMessageComposer(groupId, threadId, cfhTopic, message));
                break;
            case ReportType.MESSAGE:
                SendMessageComposer(new CallForHelpFromForumMessageMessageComposer(groupId, threadId, messageId, cfhTopic, message));
                break;
            case ReportType.PHOTO:
                SendMessageComposer(new CallForHelpFromPhotoMessageComposer(extraData, cfhTopic, roomId, myUserId, roomObjectId));
                break;      
        }

        CreateLinkEvent('help/hide');
    }

    return (
        <>
            <Column gap={1}>
                <Text fontSize={4}>{LocalizeText('help.cfh.button.send')}</Text>
                <Text>{ LocalizeText('help.main.summary') }</Text>
            </Column>
            <Button variant="success" onClick={submitReport}>
                {LocalizeText('guide.help.request.emergency.submit.button')}
            </Button>
        </>
    )
}
