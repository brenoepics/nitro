import { CallForHelpDisabledNotifyMessageEvent, CallForHelpPendingCallsDeletedMessageEvent, CallForHelpPendingCallsMessageEvent, CallForHelpReplyMessageEvent, CallForHelpResultMessageEvent, DeletePendingCallsForHelpMessageComposer, GetPendingCallsForHelpMessageComposer, IssueCloseNotificationMessageEvent } from '@nitrots/nitro-renderer';
import { FC, useCallback } from 'react';
import { LocalizeText, NotificationAlertType, NotificationUtilities, SendMessageComposer } from '../../api';
import { UseMessageEventHook } from '../../hooks';
import { CallForHelpResult } from './common/CallForHelpResult';
import { GetCloseReasonKey } from './common/GetCloseReasonKey';
 
export const HelpMessageHandler: FC<{}> = props =>
{
    const onCallForHelpResultMessageEvent = useCallback((event: CallForHelpResultMessageEvent) =>
    {
        const parser = event.getParser();

        let message = parser.messageText;

        switch(parser.resultType)
        {
            case CallForHelpResult.TOO_MANY_PENDING_CALLS_CODE:
                SendMessageComposer(new GetPendingCallsForHelpMessageComposer());
                NotificationUtilities.simpleAlert(LocalizeText('help.cfh.error.pending'), NotificationAlertType.MODERATION, null, null, LocalizeText('help.cfh.error.title'));
                break;
            case CallForHelpResult.HAS_ABUSIVE_CALL_CODE:
                NotificationUtilities.simpleAlert(LocalizeText('help.cfh.error.abusive'), NotificationAlertType.MODERATION, null, null, LocalizeText('help.cfh.error.title'));
                break;
            default:
                if(message.trim().length === 0)
                {
                    message = LocalizeText('help.cfh.sent.text');
                }
                NotificationUtilities.simpleAlert(message, NotificationAlertType.MODERATION, null, null, LocalizeText('help.cfh.sent.title'));
        }
    }, []);

    UseMessageEventHook(CallForHelpResultMessageEvent, onCallForHelpResultMessageEvent);

    const onIssueCloseNotificationMessageEvent = useCallback((event: IssueCloseNotificationMessageEvent) =>
    {
        const parser = event.getParser();

        const message = parser.messageText.length === 0 ? LocalizeText('help.cfh.closed.' + GetCloseReasonKey(parser.closeReason)) : parser.messageText;

        NotificationUtilities.simpleAlert(message, NotificationAlertType.MODERATION, null, null, LocalizeText('mod.alert.title'));
    }, []);

    UseMessageEventHook(IssueCloseNotificationMessageEvent, onIssueCloseNotificationMessageEvent);

    const onCallForHelpPendingCallsMessageEvent = useCallback((event: CallForHelpPendingCallsMessageEvent) =>
    {
        const parser = event.getParser();

        if(parser.count > 0)
        {
            NotificationUtilities.confirm(LocalizeText('help.emergency.pending.title') + '\n' + parser.pendingCalls[0].message, () =>
            {
                SendMessageComposer(new DeletePendingCallsForHelpMessageComposer());
            }, null, LocalizeText('help.emergency.pending.button.discard'), LocalizeText('help.emergency.pending.button.keep'), LocalizeText('help.emergency.pending.message.subtitle'));
        }
        
    }, []);

    UseMessageEventHook(CallForHelpPendingCallsMessageEvent, onCallForHelpPendingCallsMessageEvent);

    const onCallForHelpPendingCallsDeletedMessageEvent = useCallback((event: CallForHelpPendingCallsDeletedMessageEvent) =>
    {
        const message = 'Your pending calls were deleted'; // todo: add localization

        NotificationUtilities.simpleAlert(message, NotificationAlertType.MODERATION, null, null, LocalizeText('mod.alert.title'));
    }, []);

    UseMessageEventHook(CallForHelpPendingCallsDeletedMessageEvent, onCallForHelpPendingCallsDeletedMessageEvent);

    const onCallForHelpReplyMessageEvent = useCallback((event: CallForHelpReplyMessageEvent) =>
    {
        const parser = event.getParser();

        NotificationUtilities.simpleAlert(parser.message, NotificationAlertType.MODERATION, null, null, LocalizeText('help.cfh.reply.title'));
    }, []);
    
    UseMessageEventHook(CallForHelpReplyMessageEvent, onCallForHelpReplyMessageEvent);

    const onCallForHelpDisabledNotifyMessageEvent = useCallback((event: CallForHelpDisabledNotifyMessageEvent) =>
    {
        const parser = event.getParser();

        NotificationUtilities.simpleAlert(LocalizeText('help.emergency.global_mute.message'), NotificationAlertType.MODERATION, parser.infoUrl, LocalizeText('help.emergency.global_mute.link'), LocalizeText('help.emergency.global_mute.subtitle'))
    }, []);

    UseMessageEventHook(CallForHelpDisabledNotifyMessageEvent, onCallForHelpDisabledNotifyMessageEvent);

    return null;
}
