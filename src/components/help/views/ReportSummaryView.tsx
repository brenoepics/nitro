import { CallForHelpMessageComposer } from '@nitrots/nitro-renderer';
import { FC } from 'react';
import { CreateLinkEvent, LocalizeText, SendMessageComposer } from '../../../api';
import { Button, Column, Text } from '../../../common';
import { useHelpContext } from '../HelpContext';

export const ReportSummaryView: FC<{}> = props =>
{
    const { helpReportState = null } = useHelpContext();
    const { reportedChats, cfhTopic, reportedUserId, message } = helpReportState;
    
    const submitReport = () =>
    {
        const roomId = reportedChats[0].roomId;
        const chats: (string | number )[] = [];

        reportedChats.forEach(entry =>
        {
            chats.push(entry.entityId);
            chats.push(entry.message);
        });

        SendMessageComposer(new CallForHelpMessageComposer(message, cfhTopic, reportedUserId, roomId, chats));

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
