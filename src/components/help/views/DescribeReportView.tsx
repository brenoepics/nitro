import { FC, useCallback, useState } from 'react';
import { LocalizeText } from '../../../api';
import { Button, Column, Flex, Text } from '../../../common';
import { ReportState } from '../common/ReportState';
import { ReportType } from '../common/ReportType';
import { useHelpContext } from '../HelpContext';

export const DescribeReportView: FC<{}> = props =>
{
    const [ message, setMessage ] = useState('');
    const { setHelpReportState = null, helpReportState } = useHelpContext();

    const submitMessage = useCallback(() =>
    {
        if(message.length < 15) return;

        setHelpReportState(prevValue =>
        {
            const currentStep = ReportState.REPORT_SUMMARY;

            return { ...prevValue, message, currentStep };
        });
    }, [message, setHelpReportState]);

    const back = () =>
    {
        setHelpReportState(prevValue =>
            {
                const currentStep = (prevValue.currentStep - 1);

                return { ...prevValue, currentStep };
            });
    }

    return (
        <>
            <Column gap={ 1 }>
                <Text fontSize={ 4 }>{ LocalizeText('help.emergency.chat_report.subtitle') }</Text>
                <Text>{ LocalizeText('help.cfh.input.text') }</Text>
            </Column>
            <textarea className="form-control h-100" value={ message } onChange={ event => setMessage(event.target.value) } />
            <Flex gap={ 2 } justifyContent="between">
                <Button variant="secondary" disabled={ !(helpReportState.reportType === ReportType.BULLY || helpReportState.reportType === ReportType.EMERGENCY) } onClick={ back }>
                    { LocalizeText('generic.back') }
                </Button>
                <Button disabled={ (message.length < 15) } onClick={ submitMessage }>
                    { LocalizeText('help.emergency.main.submit.button') }
                </Button>
            </Flex>
        </>
    );
}
