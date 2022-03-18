import { ILinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, useCallback, useEffect, useState } from 'react';
import { AddEventLinkTracker, LocalizeText, RemoveLinkEventTracker } from '../../api';
import { Base, Column, Grid, NitroCardContentView, NitroCardHeaderView, NitroCardView } from '../../common';
import { HelpReportEvent } from '../../events/help/HelpReportEvent';
import { UseUiEvent } from '../../hooks';
import { IHelpReportState } from './common/IHelpReportState';
import { ReportType } from './common/ReportType';
import { HelpContextProvider } from './HelpContext';
import { HelpMessageHandler } from './HelpMessageHandler';
import { DescribeReportView } from './views/DescribeReportView';
import { HelpIndexView } from './views/HelpIndexView';
import { NameChangeView } from './views/name-change/NameChangeView';
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
        }
    }, []);

    const onHelpReportEvent = useCallback((event: HelpReportEvent) =>
    {
        let report: IHelpReportState;

        switch(event.reportType)
        {
            case ReportType.BULLY:
                report = {
                    reportType: event.reportType,
                    reportedUserId: event.reportedUserId,
                    reportedChats: [],
                    cfhCategory: -1,
                    cfhTopic: -1,
                    roomId: -1,
                    message: '',
                    currentStep: 2
                }

        }
        setHelpReportState(report);
        
        setIsVisible(true);
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
        if(!isVisible) return;

        setHelpReportState(defaultReportState);
    }, [ isVisible ]);

    const CurrentStepView = useCallback(() =>
    {
        switch(helpReportState.currentStep)
        {
            case 0: return <HelpIndexView />
            case 1: return <SelectReportedUserView />
            case 2: return <SelectReportedChatsView />
            case 3: return <SelectTopicView />
            case 4: return <DescribeReportView />
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
