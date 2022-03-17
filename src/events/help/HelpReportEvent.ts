import { NitroEvent } from '@nitrots/nitro-renderer';

export class HelpReportEvent extends NitroEvent
{
    public static REPORT: string = 'HCE_HELP_CENTER_REPORT';

    private _reportType: number;
    private _reportedUserId: number;
    private _reportedUserName: string;
    private _reportedRoomId: number;
    private _reportedRoomName: string;
    private _reportedRoomDescription: string;
    private _reportedGroupId: number;
    private _reportedThreadId: number;
    private _reportedMessageId: number;
    private _reportedExtraDataId: number;
    private _reportedRoomObjectId: number;

    constructor(reportType: number)
    {
        super(HelpReportEvent.REPORT);

        this._reportType = reportType;
    }

    public get reportType(): number
    {
        return this._reportType;
    }

    public get reportedUserId(): number
    {
        return this._reportedUserId;
    }

    public set reportedUserId(id: number)
    {
        this._reportedUserId = id;
    }

    public get reportedUserName(): string
    {
        return this._reportedUserName;
    }
    public set reportedUserName(value: string)
    {
        this._reportedUserName = value;
    }

    public get reportedRoomId(): number
    {
        return this._reportedRoomId;
    }
    public set reportedRoomId(value: number)
    {
        this._reportedRoomId = value;
    }

    public get reportedRoomName(): string
    {
        return this._reportedRoomName;
    }
    public set reportedRoomName(value: string)
    {
        this._reportedRoomName = value;
    }

    public get reportedRoomDescription(): string
    {
        return this._reportedRoomDescription;
    }
    public set reportedRoomDescription(value: string)
    {
        this._reportedRoomDescription = value;
    }
    public get reportedGroupId(): number
    {
        return this._reportedGroupId;
    }
    public set reportedGroupId(value: number)
    {
        this._reportedGroupId = value;
    }
    public get reportedThreadId(): number
    {
        return this._reportedThreadId;
    }
    public set reportedThreadId(value: number)
    {
        this._reportedThreadId = value;
    }
    public get reportedMessageId(): number
    {
        return this._reportedMessageId;
    }
    public set reportedMessageId(value: number)
    {
        this._reportedMessageId = value;
    }
    public get reportedExtraDataId(): number
    {
        return this._reportedExtraDataId;
    }
    public set reportedExtraDataId(value: number)
    {
        this._reportedExtraDataId = value;
    }
    public get reportedRoomObjectId(): number
    {
        return this._reportedRoomObjectId;
    }
    public set reportedRoomObjectId(value: number)
    {
        this._reportedRoomObjectId = value;
    }
}
