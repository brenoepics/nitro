import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RoomDataParser } from '@nitrots/nitro-renderer';
import { FC, MouseEvent } from 'react';
import { CreateRoomSession, GetSessionDataManager, TryVisitRoom } from '../../../../api';
import { Flex, LayoutBadgeImageView, LayoutGridItemProps, LayoutRoomThumbnailView, Text } from '../../../../common';
import { UpdateDoorStateEvent } from '../../../../events';
import { DispatchUiEvent } from '../../../../hooks';
import { NavigatorSearchResultItemInfoView } from './NavigatorSearchResultItemInfoView';

export interface NavigatorSearchResultItemViewProps extends LayoutGridItemProps
{
    roomData: RoomDataParser
    thumbnail?: boolean
}

export const NavigatorSearchResultItemView: FC<NavigatorSearchResultItemViewProps> = props =>
{
    const { roomData = null, children = null, thumbnail = false, ...rest } = props;

    function getUserCounterColor(): string
    {
        const num: number = (100 * (roomData.userCount / roomData.maxUserCount));

        let bg = 'bg-primary';

        if(num >= 92)
        {
            bg = 'bg-danger';
        }
        else if(num >= 50)
        {
            bg = 'bg-warning';
        }
        else if(num > 0)
        {
            bg = 'bg-success';
        }

        return bg;
    }

    function openInfo(event: MouseEvent): void
    {
        event.stopPropagation();
        console.log('info');
    }

    function visitRoom(): void
    {
        if(roomData.ownerId !== GetSessionDataManager().userId)
        {
            if(roomData.habboGroupId !== 0)
            {
                TryVisitRoom(roomData.roomId);

                return;
            }

            switch(roomData.doorMode)
            {
                case RoomDataParser.DOORBELL_STATE:
                    DispatchUiEvent(new UpdateDoorStateEvent(UpdateDoorStateEvent.START_DOORBELL, roomData));
                    return;
                case RoomDataParser.PASSWORD_STATE:
                    DispatchUiEvent(new UpdateDoorStateEvent(UpdateDoorStateEvent.START_PASSWORD, roomData));
                    return;
            }
        }
        
        CreateRoomSession(roomData.roomId);
    }

    if(thumbnail) return (
        <Flex pointer overflow="hidden" column={ true } alignItems="center" onClick={visitRoom} gap={0} className="navigator-item p-1 bg-light rounded-3 small mb-1 flex-column border border-muted" {...rest}>
            <LayoutRoomThumbnailView roomId={roomData.roomId} customUrl={roomData.officialRoomPicRef} className="d-flex flex-column align-items-center justify-content-end mb-1">
                <LayoutBadgeImageView badgeCode={roomData.groupBadgeCode} isGroup={true} className={ 'position-absolute top-0 start-0 m-1' } />
                <Flex center className={ 'badge p-1 position-absolute m-1 ' + getUserCounterColor() } gap={ 1 }>
                    <FontAwesomeIcon icon="user" />
                    { roomData.userCount }
                </Flex>
                { (roomData.doorMode !== RoomDataParser.OPEN_STATE) && 
                        <i className={ ('position-absolute end-0 mb-1 me-1 icon icon-navigator-room-' + ((roomData.doorMode === RoomDataParser.DOORBELL_STATE) ? 'locked' : (roomData.doorMode === RoomDataParser.PASSWORD_STATE) ? 'password' : (roomData.doorMode === RoomDataParser.INVISIBLE_STATE) ? 'invisible' : '')) } /> }
            </LayoutRoomThumbnailView>
            <Flex className='w-100'>
                <Text truncate className="flex-grow-1">{roomData.roomName}</Text>
                <Flex reverse alignItems="center" gap={ 1 }>
                    <NavigatorSearchResultItemInfoView roomData={ roomData } />
                </Flex>
                { children } 
            </Flex>

        </Flex>
    );

    return (
        <Flex pointer overflow="hidden" alignItems="center" onClick={ visitRoom } gap={ 2 } className="navigator-item px-2 py-1 small" { ...rest }>
            <Flex center className={ 'badge p-1 ' + getUserCounterColor() } gap={ 1 }>
                <FontAwesomeIcon icon="user" />
                { roomData.userCount }
            </Flex>
            <Text truncate className="flex-grow-1">{ roomData.roomName }</Text>
            <Flex reverse alignItems="center" gap={ 1 }>
                <NavigatorSearchResultItemInfoView roomData={ roomData } />
                { roomData.habboGroupId > 0 && <i className="icon icon-navigator-room-group" /> }
                { (roomData.doorMode !== RoomDataParser.OPEN_STATE) && 
                    <i className={ ('icon icon-navigator-room-' + ((roomData.doorMode === RoomDataParser.DOORBELL_STATE) ? 'locked' : (roomData.doorMode === RoomDataParser.PASSWORD_STATE) ? 'password' : (roomData.doorMode === RoomDataParser.INVISIBLE_STATE) ? 'invisible' : '')) } /> }
            </Flex>
            { children }
        </Flex>
    );
}
