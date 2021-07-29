import { CatalogModeComposer, CatalogPageComposer, CatalogRequestGiftConfigurationComposer, ICatalogPageData, ILinkEventTracker, RoomPreviewer } from 'nitro-renderer';
import { FC, useCallback, useEffect, useReducer, useState } from 'react';
import { AddEventLinkTracker, GetRoomEngine, RemoveLinkEventTracker } from '../../api';
import { CatalogEvent } from '../../events';
import { useUiEvent } from '../../hooks/events/ui/ui-event';
import { SendMessageHook } from '../../hooks/messages/message-event';
import { NitroCardContentView, NitroCardHeaderView, NitroCardTabsItemView, NitroCardTabsView, NitroCardView } from '../../layout';
import { LocalizeText } from '../../utils/LocalizeText';
import { CatalogMessageHandler } from './CatalogMessageHandler';
import { CatalogMode, CatalogViewProps } from './CatalogView.types';
import { BuildCatalogPageTree } from './common/CatalogUtilities';
import { CatalogContextProvider } from './context/CatalogContext';
import { CatalogReducer, initialCatalog } from './reducers/CatalogReducer';
import { ACTIVE_PAGES, CatalogNavigationView } from './views/navigation/CatalogNavigationView';
import { CatalogPageView } from './views/page/CatalogPageView';

export const CatalogView: FC<CatalogViewProps> = props =>
{
    const [ isVisible, setIsVisible ] = useState(false);
    const [ roomPreviewer, setRoomPreviewer ] = useState<RoomPreviewer>(null);
    const [ pendingPageLookup, setPendingPageLookup ] = useState<{ value: string, isOffer: boolean }>(null);
    const [ pendingTree, setPendingTree ] = useState<ICatalogPageData[]>(null);
    const [ pendingOpenTree, setPendingOpenTree ] = useState<ICatalogPageData[]>(null);
    const [ catalogState, dispatchCatalogState ] = useReducer(CatalogReducer, initialCatalog);
    const [ currentTab, setCurrentTab ] = useState<ICatalogPageData>(null);
    const { root = null, pageParser = null, activeOffer = null, searchResult = null} = catalogState;

    const saveActivePages = useCallback(() =>
    {
        setPendingOpenTree(ACTIVE_PAGES.slice());
    }, []);

    const onCatalogEvent = useCallback((event: CatalogEvent) =>
    {
        let save = false;

        switch(event.type)
        {
            case CatalogEvent.SHOW_CATALOG:
                setIsVisible(true);
                return;
            case CatalogEvent.HIDE_CATALOG:
                save = true;
                setIsVisible(false);
                return;   
            case CatalogEvent.TOGGLE_CATALOG:
                save = true;
                setIsVisible(value => !value);
                return;
        }

        if(save) saveActivePages();
    }, [ saveActivePages ]);

    useUiEvent(CatalogEvent.SHOW_CATALOG, onCatalogEvent);
    useUiEvent(CatalogEvent.HIDE_CATALOG, onCatalogEvent);
    useUiEvent(CatalogEvent.TOGGLE_CATALOG, onCatalogEvent);
    useUiEvent(CatalogEvent.CATALOG_RESET, onCatalogEvent);

    const linkReceived = useCallback((url: string) =>
    {
        const parts = url.split('/');

        if(parts.length < 2) return;

        switch(parts[1])
        {
            case 'open':
                if(parts.length > 2)
                {
                    if(parts.length === 4)
                    {
                        switch(parts[2])
                        {
                            case 'offerId':
                                setPendingPageLookup({ value: parts[3], isOffer: true });

                                return;
                        }
                    }

                    setPendingPageLookup({ value: parts[2], isOffer: false });
                }
                else
                {
                    setIsVisible(true);
                }

                return;
        }
    }, []);

    useEffect(() =>
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived,
            eventUrlPrefix: 'catalog/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, [ linkReceived ]);

    useEffect(() =>
    {
        const loadCatalog = (((pendingPageLookup !== null) && !catalogState.root) || (isVisible && !catalogState.root));

        if(loadCatalog)
        {
            SendMessageHook(new CatalogModeComposer(CatalogMode.MODE_NORMAL));
            SendMessageHook(new CatalogRequestGiftConfigurationComposer());

            return;
        }

        if(catalogState.root)
        {
            if(!isVisible && (pendingPageLookup !== null))
            {
                setIsVisible(true);

                return;
            }

            if(pendingPageLookup !== null || pendingOpenTree)
            {
                let tree: ICatalogPageData[] = [];

                if(pendingPageLookup !== null)
                {
                    tree = BuildCatalogPageTree(catalogState.root, pendingPageLookup.value, pendingPageLookup.isOffer);
                }
                else
                {
                    tree = pendingOpenTree.slice();
                }

                setCurrentTab(tree.shift());
                setPendingOpenTree(null);
                setPendingPageLookup(null);
                setPendingTree(tree);
            }
            else
            {
                setCurrentTab(prevValue =>
                    {
                        if(catalogState.root.children.length)
                        {
                            if(prevValue)
                            {
                                if(catalogState.root.children.indexOf(prevValue) >= 0) return prevValue;
                            }

                            return ((catalogState.root.children.length && catalogState.root.children[0]) || null);
                        }

                        return null;
                    });
            }
        }
    }, [ isVisible, pendingPageLookup, pendingOpenTree, catalogState.root, setCurrentTab ]);

    useEffect(() =>
    {
        if(!currentTab) return;

        SendMessageHook(new CatalogPageComposer(currentTab.pageId, -1, CatalogMode.MODE_NORMAL));
    }, [ currentTab ]);

    useEffect(() =>
    {
        setRoomPreviewer(new RoomPreviewer(GetRoomEngine(), ++RoomPreviewer.PREVIEW_COUNTER));

        return () =>
        {
            setRoomPreviewer(prevValue =>
                {
                    prevValue.dispose();

                    return null;
                });
        }
    }, []);

    const currentNavigationPage = ((searchResult && searchResult.page) || currentTab);
    const navigationHidden = (pageParser && pageParser.frontPageItems.length);

    return (
        <CatalogContextProvider value={ { catalogState, dispatchCatalogState } }>
            <CatalogMessageHandler />
            { isVisible &&
                <NitroCardView className="nitro-catalog">
                    <NitroCardHeaderView headerText={ LocalizeText('catalog.title') } onCloseClick={ event => { saveActivePages(); setIsVisible(false); } } />
                    <NitroCardTabsView>
                        { root && root.children.length && root.children.map((page, index) =>
                            {
                                return (
                                    <NitroCardTabsItemView key={ index } isActive={ (currentTab === page) } onClick={ event => setCurrentTab(page) }>
                                        { page.localization }
                                    </NitroCardTabsItemView>
                                );
                            }) }
                    </NitroCardTabsView>
                    <NitroCardContentView>
                        <div className="row h-100">
                            { currentNavigationPage && !navigationHidden &&
                                <div className="col-3 d-flex flex-column h-100">
                                    <CatalogNavigationView page={ currentNavigationPage } pendingTree={ pendingTree } setPendingTree={ setPendingTree } />
                                </div> }
                            <div className="col h-100">
                                <CatalogPageView roomPreviewer={ roomPreviewer } />
                            </div>
                        </div>
                    </NitroCardContentView>
                </NitroCardView> }
        </CatalogContextProvider>
    );
}
