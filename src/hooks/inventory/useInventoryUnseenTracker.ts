import { UnseenItemsEvent, UnseenResetCategoryComposer, UnseenResetItemsComposer } from '@nitrots/nitro-renderer';
import { useCallback, useState } from 'react';
import { useBetween } from 'use-between';
import { UseMessageEventHook } from '..';
import { SendMessageComposer } from '../../api';

const sendResetCategoryMessage = (category: number) => SendMessageComposer(new UnseenResetCategoryComposer(category));
const sendResetItemsMessage = (category: number, itemIds: number[]) => SendMessageComposer(new UnseenResetItemsComposer(category, ...itemIds));

const useInventoryUnseenTrackerState = () =>
{
    const [ unseenItems, setUnseenItems ] = useState<Map<number, number[]>>(new Map());
    const getIds = (category: number) => unseenItems.get(category);
    const getCount = (category: number) => (unseenItems.get(category)?.length || 0);

    const getFullCount = () =>
    {
        let count = 0;

        for(const key of unseenItems.keys()) count += getCount(key);

        return count;
    }

    const resetCategory = useCallback((category: number) =>
    {
        let didReset = true;

        setUnseenItems(prevValue =>
        {
            if(!prevValue.has(category))
            {
                didReset = false;

                return prevValue;
            }

            const newValue = new Map(prevValue);

            newValue.delete(category);

            sendResetCategoryMessage(category);

            return newValue;
        });

        return didReset;
    }, []);

    const resetItems = useCallback((category: number, itemIds: number[]) =>
    {
        let didReset = true;

        setUnseenItems(prevValue =>
        {
            if(!prevValue.has(category))
            {
                didReset = false;

                return prevValue;
            }

            const newValue = new Map(prevValue);
            const existing = newValue.get(category);

            if(existing) for(const itemId of itemIds) existing.splice(existing.indexOf(itemId), 1);

            sendResetItemsMessage(category, itemIds);

            return newValue;
        });

        return didReset;
    }, []);

    const isUnseen = useCallback((category: number, itemId: number) =>
    {
        if(!unseenItems.has(category)) return false;

        const items = unseenItems.get(category);

        return (items.indexOf(itemId) >= 0);
    }, [ unseenItems ]);

    const removeUnseen = useCallback((category: number, itemId: number) =>
    {
        setUnseenItems(prevValue =>
        {
            if(!prevValue.has(category)) return prevValue;

            const newValue = new Map(prevValue);
            const items = newValue.get(category);
            const index = items.indexOf(itemId);

            if(index >= 0) items.splice(index, 1);

            return newValue;
        });
    }, []);

    const onUnseenItemsEvent = useCallback((event: UnseenItemsEvent) =>
    {
        const parser = event.getParser();

        setUnseenItems(prevValue =>
        {
            const newValue = new Map(prevValue);

            for(const category of parser.categories)
            {
                let existing = newValue.get(category);

                if(!existing)
                {
                    existing = [];

                    newValue.set(category, existing);
                }

                const itemIds = parser.getItemsByCategory(category);

                for(const itemId of itemIds) ((existing.indexOf(itemId) === -1) && existing.push(itemId));
            }

            return newValue;
        });
    }, []);

    UseMessageEventHook(UnseenItemsEvent, onUnseenItemsEvent);

    return { getIds, getCount, getFullCount, resetCategory, resetItems, isUnseen, removeUnseen };
}

export const useInventoryUnseenTracker = () => useBetween(useInventoryUnseenTrackerState);
