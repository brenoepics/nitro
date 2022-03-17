import { IChatEntry } from '../../chat-history/common/IChatEntry';

export interface IHelpReportState
{
    reportType: number;
    reportedUserId: number;
    reportedChats: IChatEntry[];
    cfhCategory: number;
    cfhTopic: number;
    roomId: number;
    message: string;
    currentStep: number;
}
