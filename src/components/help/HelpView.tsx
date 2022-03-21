import { ILinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, useCallback, useEffect, useState } from 'react';
import { AddEventLinkTracker, LocalizeText, RemoveLinkEventTracker } from '../../api';
import { Base, Column, Grid, NitroCardContentView, NitroCardHeaderView, NitroCardView } from '../../common';
import { HelpReportEvent } from '../../events/help/HelpReportEvent';
import { BatchUpdates, UseUiEvent } from '../../hooks';
import { IHelpReportState } from './common/IHelpReportState';
import { ReportState } from './common/ReportState';
import { ReportType } from './common/ReportType';
import { HelpContextProvider } from './HelpContext';
import { HelpMessageHandler } from './HelpMessageHandler';
import { DescribeReportView } from './views/DescribeReportView';
import { HelpIndexView } from './views/HelpIndexView';
import { NameChangeView } from './views/name-change/NameChangeView';
import { ReportSummaryView } from './views/ReportSummaryView';
import { SanctionSatusView } from './views/SanctionStatusView';
import { SelectReportedChatsView } from './views/SelectReportedChatsView';
import { SelectReportedUserView } from './views/SelectReportedUserView';
import { SelectTopicView } from './views/SelectTopicView';

const defaultReportState = {
    reportType: ReportType.BULLY,
    reportedUserId: -1,
    reportedChats: [],
    cfhCategory: -1,
    cfhTopic: -1,
    roomId: -1,
    roomName: '',
    messageId: -1,
    threadId: -1,
    groupId: -1,
    extraData: '',
    roomObjectId: -1,
    message: '',
    currentStep: 0
};

export const HelpView: FC<{}> = props =>
{
    const [ isVisible, setIsVisible ] = useState(false);
    const [ helpReportState, setHelpReportState ] = useState<IHelpReportState>(defaultReportState);

    const linkReceived = useCallback((url: string) =>
    {
        const parts = url.split('/');

        if(parts.length < 2) return;

        switch(parts[1])
        {
            case 'show':
                setIsVisible(true);
                return;
            case 'hide':
                setIsVisible(false);
                return;
            case 'toggle':
                setIsVisible(prevValue => !prevValue);
                return;
            case 'tour':
                // todo: launch tour
                return;
            case 'report':
                if(parts.length >= 5 && parts[2] === 'room')
                {
                    const roomId = parseInt(parts[3]);
                    const unknown = unescape(parts.splice(4).join('/'));
                    //this.reportRoom(roomId, unknown, "");
                }
                return;
        }
    }, []);

    const onHelpReportEvent = useCallback((event: HelpReportEvent) =>
    {
        let report: IHelpReportState = { ...defaultReportState };

        report.reportType =  event.reportType;

        switch(event.reportType)
        {
            case ReportType.BULLY:
            case ReportType.EMERGENCY:
            case ReportType.IM:
                report.reportedUserId = event.reportedUserId;
                report.currentStep = ReportState.SELECT_CHATS;
                break;
            case ReportType.ROOM:
                report.roomId = event.reportedRoomId;
                report.roomName = event.reportedRoomName;
                report.currentStep = ReportState.SELECT_TOPICS;
                break;
            case ReportType.THREAD:
                report.groupId = event.reportedGroupId;
                report.threadId = event.reportedThreadId;
                report.currentStep = ReportState.SELECT_TOPICS;
                break;
            case ReportType.MESSAGE:
                report.groupId = event.reportedGroupId;
                report.threadId = event.reportedThreadId;
                report.messageId = event.reportedMessageId;
                report.currentStep = ReportState.SELECT_TOPICS;
                break;
            case ReportType.PHOTO:
                break;
            case ReportType.GUIDE:
                break;
        }
        
        BatchUpdates(() =>
        {
            setHelpReportState(report);
            setIsVisible(true);
        });
        
    }, []);

    UseUiEvent(HelpReportEvent.REPORT, onHelpReportEvent);

    useEffect(() =>
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived,
            eventUrlPrefix: 'help/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, [ linkReceived ]);

    useEffect(() =>
    {
        if(!isVisible) setHelpReportState(defaultReportState);
    }, [ isVisible ]);

    const CurrentStepView = useCallback(() =>
    {
        switch(helpReportState.currentStep)
        {
            case ReportState.INDEX: return <HelpIndexView />
            case ReportState.SELECT_USER: return <SelectReportedUserView />
            case ReportState.SELECT_CHATS: return <SelectReportedChatsView />
            case ReportState.SELECT_TOPICS: return <SelectTopicView />
            case ReportState.INPUT_REPORT_MESSAGE: return <DescribeReportView />
            case ReportState.REPORT_SUMMARY: return <ReportSummaryView />
        }

        return null;
    }, [helpReportState.currentStep]);

    return (
        <HelpContextProvider value={ { helpReportState, setHelpReportState } }>
            <HelpMessageHandler />
            { isVisible &&
                <NitroCardView className="nitro-help" theme="primary-slim">
                    <NitroCardHeaderView headerText={ LocalizeText('help.button.cfh') } onCloseClick={ event => setIsVisible(false) } />
                    <NitroCardContentView className="text-black">
                        <Grid>
                            <Column center size={ 5 } overflow="hidden">
                                <Base className="index-image" />
                            </Column>
                            <Column justifyContent="between" size={ 7 } overflow="hidden">
                                <CurrentStepView />
                            </Column>
                        </Grid>
                    </NitroCardContentView>
                </NitroCardView> }
            <SanctionSatusView />
            <NameChangeView />
        </HelpContextProvider>
    );
}
