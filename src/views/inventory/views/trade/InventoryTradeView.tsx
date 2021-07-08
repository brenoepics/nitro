import { FurnitureListComposer, IObjectData, TradingAcceptComposer, TradingConfirmationComposer, TradingListAddItemComposer, TradingListAddItemsComposer, TradingListItemRemoveComposer, TradingUnacceptComposer } from 'nitro-renderer';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { SendMessageHook } from '../../../../hooks/messages';
import { NitroCardGridItemView } from '../../../../layout/card/grid/item/NitroCardGridItemView';
import { NitroCardGridView } from '../../../../layout/card/grid/NitroCardGridView';
import { LocalizeText } from '../../../../utils/LocalizeText';
import { FurniCategory } from '../../common/FurniCategory';
import { GroupItem } from '../../common/GroupItem';
import { IFurnitureItem } from '../../common/IFurnitureItem';
import { TradeState } from '../../common/TradeState';
import { _Str_16998 } from '../../common/TradingUtilities';
import { useInventoryContext } from '../../context/InventoryContext';
import { InventoryFurnitureActions } from '../../reducers/InventoryFurnitureReducer';
import { InventoryFurnitureSearchView } from '../furniture/search/InventoryFurnitureSearchView';
import { InventoryTradeViewProps } from './InventoryTradeView.types';

const MAX_ITEMS_TO_TRADE: number = 9;

export const InventoryTradeView: FC<InventoryTradeViewProps> = props =>
{
    const { cancelTrade = null } = props;
    const [ groupItem, setGroupItem ] = useState<GroupItem>(null);
    const [ ownGroupItem, setOwnGroupItem ] = useState<GroupItem>(null);
    const [ otherGroupItem, setOtherGroupItem ] = useState<GroupItem>(null);
    const [ filteredGroupItems, setFilteredGroupItems ] = useState<GroupItem[]>(null);
    const [ countdownTick, setCountdownTick ] = useState(3);
    const { furnitureState = null, dispatchFurnitureState = null } = useInventoryContext();
    const { needsFurniUpdate = false, groupItems = [], tradeData = null } = furnitureState;

    const canTradeItem = useCallback((isWallItem: boolean, spriteId: number, category: number, groupable: boolean, stuffData: IObjectData) =>
    {
        if(!tradeData || !tradeData.ownUser || tradeData.ownUser.accepts || !tradeData.ownUser.items) return false;

        if(tradeData.ownUser.items.length < MAX_ITEMS_TO_TRADE) return true;

        if(!groupable) return false;

        let type = spriteId.toString();

        if(category === FurniCategory._Str_5186)
        {
            type = ((type + 'poster') + stuffData.getLegacyString());
        }
        else
        {
            if(category === FurniCategory._Str_12454)
            {
                type = _Str_16998(spriteId, stuffData);
            }
            else
            {
                type = (((isWallItem) ? 'I' : 'S') + type);
            }
        }

        return !!tradeData.ownUser.items.getValue(type);
    }, [ tradeData ]);

    const attemptItemOffer = useCallback((count: number) =>
    {
        if(!tradeData || !groupItem) return;

        const tradeItems = groupItem.getTradeItems(count);

        if(!tradeItems || !tradeItems.length) return;

        let coreItem: IFurnitureItem = null;
        const itemIds: number[] = [];

        for(const item of tradeItems)
        {
            itemIds.push(item.id);

            if(!coreItem) coreItem = item;
        }

        const ownItemCount = tradeData.ownUser.items.length;

        if((ownItemCount + itemIds.length) <= 1500)
        {
            if(!coreItem.isGroupable && (itemIds.length))
            {
                SendMessageHook(new TradingListAddItemComposer(itemIds.pop()));
            }
            else
            {
                const tradeIds: number[] = [];

                for(const itemId of itemIds)
                {
                    if(canTradeItem(coreItem.isWallItem, coreItem.type, coreItem.category, coreItem.isGroupable, coreItem.stuffData))
                    {
                        tradeIds.push(itemId);
                    }
                }

                if(tradeIds.length)
                {
                    if(tradeIds.length === 1)
                    {
                        SendMessageHook(new TradingListAddItemComposer(tradeIds.pop()));
                    }
                    else
                    {
                        SendMessageHook(new TradingListAddItemsComposer(...tradeIds));
                    }
                }
            }
        }
        else
        {
            //this._notificationService.alert('${trading.items.too_many_items.desc}', '${trading.items.too_many_items.title}');
        }
    }, [ groupItem, tradeData, canTradeItem ]);

    const removeItem = useCallback((group: GroupItem) =>
    {
        const item = group.getLastItem();

        if(!item) return;

        SendMessageHook(new TradingListItemRemoveComposer(item.id));
    }, []);

    useEffect(() =>
    {
        if(needsFurniUpdate)
        {
            dispatchFurnitureState({
                type: InventoryFurnitureActions.SET_NEEDS_UPDATE,
                payload: {
                    flag: false
                }
            });

            SendMessageHook(new FurnitureListComposer());
        }

    }, [ needsFurniUpdate, groupItems, dispatchFurnitureState ]);

    const progressTrade = useCallback(() =>
    {
        switch(tradeData.state)
        {
            case TradeState.TRADING_STATE_RUNNING:
                if(!tradeData.otherUser.itemCount && !tradeData.ownUser.accepts)
                {
                    //this._notificationService.alert('${inventory.trading.warning.other_not_offering}');
                }

                if(tradeData.ownUser.accepts)
                {
                    SendMessageHook(new TradingUnacceptComposer());
                }
                else
                {
                    SendMessageHook(new TradingAcceptComposer());
                }
                return;
            case TradeState.TRADING_STATE_CONFIRMING:
                SendMessageHook(new TradingConfirmationComposer());

                dispatchFurnitureState({
                    type: InventoryFurnitureActions.SET_TRADE_STATE,
                    payload: {
                        tradeState: TradeState.TRADING_STATE_CONFIRMED
                    }
                });
                return;
        }
    }, [ tradeData, dispatchFurnitureState ]);

    const getTradeButton = useMemo(() =>
    {
        if(!tradeData) return null;

        switch(tradeData.state)
        {
            case TradeState.TRADING_STATE_READY:
                return <button type="button" className="btn btn-secondary" disabled={ (!tradeData.ownUser.itemCount && !tradeData.otherUser.itemCount) } onClick={ progressTrade }>{ LocalizeText('inventory.trading.accept') }</button>;
            case TradeState.TRADING_STATE_RUNNING:
                return <button type="button" className="btn btn-secondary" disabled={ (!tradeData.ownUser.itemCount && !tradeData.otherUser.itemCount) } onClick={ progressTrade }>{ LocalizeText(tradeData.ownUser.accepts ? 'inventory.trading.modify' : 'inventory.trading.accept') }</button>;
            case TradeState.TRADING_STATE_COUNTDOWN:
                return <button type="button" className="btn btn-secondary" disabled>{ LocalizeText('inventory.trading.countdown', [ 'counter' ], [ countdownTick.toString() ]) }</button>;
            case TradeState.TRADING_STATE_CONFIRMING:
                return <button type="button" className="btn btn-secondary" onClick={ progressTrade }>{ LocalizeText('inventory.trading.button.restore') }</button>;
            case TradeState.TRADING_STATE_CONFIRMED:
                return <button type="button" className="btn btn-secondary">{ LocalizeText('inventory.trading.info.waiting') }</button>;
        }
    }, [ tradeData, countdownTick, progressTrade ]);

    useEffect(() =>
    {
        if(!tradeData || (tradeData.state !== TradeState.TRADING_STATE_COUNTDOWN)) return;

        setCountdownTick(3);

        const interval = setInterval(() =>
        {
            setCountdownTick(prevValue =>
                {
                    const newValue = (prevValue - 1);

                    if(newValue === -1)
                    {
                        dispatchFurnitureState({
                            type: InventoryFurnitureActions.SET_TRADE_STATE,
                            payload: {
                                tradeState: TradeState.TRADING_STATE_CONFIRMING
                            }
                        });

                        clearInterval(interval);
                    }

                    return newValue;
                });
        }, 1000);

        return () =>
        {
            clearInterval(interval);
        }
    }, [ tradeData, dispatchFurnitureState ]);

    return (
        <div className="row h-100">
            <div className="d-flex flex-column col-4 h-100">
                <InventoryFurnitureSearchView groupItems={ groupItems } setGroupItems={ setFilteredGroupItems } />
                <NitroCardGridView columns={ 3 }>
                    { filteredGroupItems && (filteredGroupItems.length > 0) && filteredGroupItems.map((item, index) =>
                        {
                            const count = item.getUnlockedCount();

                            return (
                                <NitroCardGridItemView key={ index } className={ !count ? 'opacity-0-5 ' : '' } itemImage={ item.iconUrl } itemCount={ count } itemActive={ (groupItem === item) } itemUnique={ item.stuffData.isUnique } itemUniqueNumber={ item.stuffData.uniqueNumber } onClick={ event => (count && setGroupItem(item)) }>
                                    { ((count > 0) && (groupItem === item)) &&
                                        <button className="btn btn-success btn-sm trade-button" onClick={ event => attemptItemOffer(1) }>
                                            <i className="fas fa-chevron-right" />
                                        </button> }
                                </NitroCardGridItemView>
                            );
                        }) }
                </NitroCardGridView>
                <div className="col-12 badge bg-muted w-100 mt-1">{ groupItem ? groupItem.name : LocalizeText('catalog_selectproduct') }</div>
            </div>
            <div className="col-8 row">
                <div className="d-flex flex-column col-6">
                    <span className="d-flex justify-content-between align-items-center text-black small mb-1">{ LocalizeText('inventory.trading.you') } { LocalizeText('inventory.trading.areoffering') }: <i className={ 'small fas ' + (tradeData.ownUser.accepts ? 'fa-lock text-success' : 'fa-unlock text-danger') } /></span>
                    <NitroCardGridView columns={ 3 }>
                        { Array.from(Array(MAX_ITEMS_TO_TRADE), (e, i) =>
                            {
                                const item = (tradeData.ownUser.items.getWithIndex(i) || null);

                                if(!item) return <NitroCardGridItemView key={ i } />;

                                return (
                                    <NitroCardGridItemView key={ i } itemActive={ (ownGroupItem === item) } itemImage={ item.iconUrl } itemCount={ item.getTotalCount() } itemUnique={ item.stuffData.isUnique } itemUniqueNumber={ item.stuffData.uniqueNumber } onClick={ event => setOwnGroupItem(item) }>
                                        { (ownGroupItem === item) &&
                                            <button className="btn btn-danger btn-sm trade-button left" onClick={ event => removeItem(item) }>
                                                <i className="fas fa-chevron-left" />
                                            </button> }
                                    </NitroCardGridItemView>
                                );
                            }) }
                        <div className="col-12 badge bg-muted w-100">{ ownGroupItem ? ownGroupItem.name : LocalizeText('catalog_selectproduct') }</div>
                    </NitroCardGridView>
                </div>
                <div className="d-flex flex-column col-6">
                    <span className="d-flex justify-content-between align-items-center  text-black small mb-1">{ tradeData.otherUser.userName } { LocalizeText('inventory.trading.isoffering') }: <i className={ 'small fas ' + (tradeData.otherUser.accepts ? 'fa-lock text-success' : 'fa-unlock text-danger') } /></span>
                    <NitroCardGridView columns={ 3 }>
                        { Array.from(Array(MAX_ITEMS_TO_TRADE), (e, i) =>
                            {
                                const item = (tradeData.otherUser.items.getWithIndex(i) || null);

                                if(!item) return <NitroCardGridItemView key={ i } />;

                                return <NitroCardGridItemView key={ i } itemActive={ (otherGroupItem === item) } itemImage={ item.iconUrl } itemCount={ item.getTotalCount() } itemUnique={ item.stuffData.isUnique } itemUniqueNumber={ item.stuffData.uniqueNumber } onClick={ event => setOtherGroupItem(item) } />;
                            }) }
                        <div className="col-12 badge bg-muted w-100">{ otherGroupItem ? otherGroupItem.name : LocalizeText('catalog_selectproduct') }</div>
                    </NitroCardGridView>
                </div>
                <div className="d-flex col-12 justify-content-between align-items-end w-100">
                    <button type="button" className="btn btn-danger" onClick={ cancelTrade }>{ LocalizeText('generic.cancel') }</button>
                    { getTradeButton }
                </div>
            </div>
        </div>
    );
}