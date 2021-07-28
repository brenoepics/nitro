import { CatalogPageComposer, ICatalogPageData } from 'nitro-renderer';
import { FC, useCallback, useEffect, useState } from 'react';
import { SendMessageHook } from '../../../../../hooks/messages/message-event';
import { CatalogMode } from '../../../CatalogView.types';
import { CatalogIconView } from '../../catalog-icon/CatalogIconView';
import { ACTIVE_PAGES } from '../CatalogNavigationView';
import { CatalogNavigationSetView } from '../set/CatalogNavigationSetView';
import { CatalogNavigationItemViewProps } from './CatalogNavigationItemView.types';

export const CatalogNavigationItemView: FC<CatalogNavigationItemViewProps> = props =>
{
    const { page = null, isActive = false, pendingTree = null, setPendingTree = null, setActiveChild = null } = props;
    const [ isExpanded, setIsExpanded ] = useState(false);

    const select = useCallback((selectPage: ICatalogPageData, expand: boolean = false) =>
    {
        if(!selectPage) return;
        
        setActiveChild(prevValue =>
            {
                if(prevValue === selectPage)
                {
                    if(selectPage.pageId > -1) SendMessageHook(new CatalogPageComposer(selectPage.pageId, -1, CatalogMode.MODE_NORMAL));
                }
                
                return selectPage;
            });

        if(selectPage.children && selectPage.children.length)
        {
            setIsExpanded(prevValue =>
                {
                    if(expand) return true;
                    
                    return !prevValue;
                });
        }
    }, [ setActiveChild ]);

    useEffect(() =>
    {
        if(!pendingTree || !pendingTree.length) return;

        if(page !== pendingTree[0]) return;

        const newTree = [ ...pendingTree ];

        newTree.shift();

        if(newTree.length) setPendingTree(newTree);
        else setPendingTree(null);

        select(page, true);
    }, [ page, pendingTree, setPendingTree, select ]);

    useEffect(() =>
    {
        if(!isActive || !page) return;

        setIsExpanded(true);

        if(page.pageId > -1) SendMessageHook(new CatalogPageComposer(page.pageId, -1, CatalogMode.MODE_NORMAL));

        const index = (ACTIVE_PAGES.push(page) - 1);

        return () =>
        {
            ACTIVE_PAGES.length = index;
        }
    }, [ isActive, page ]);
    
    return (
        <div className="col pb-1 catalog-navigation-item-container">
            <div className={ 'd-flex align-items-center cursor-pointer catalog-navigation-item ' + (isActive ? 'active ': '') } onClick={ event => select(page) }>
                <CatalogIconView icon={ page.icon } />
                <div className="flex-grow-1 text-black text-truncate px-1">{ page.localization }</div>
                { (page.children.length > 0) && <i className={ 'fas fa-caret-' + (isExpanded ? 'up' : 'down') } /> }
            </div>
            { isActive && isExpanded && page.children && (page.children.length > 0) &&
                <div className="d-flex flex-column mt-1">
                    <CatalogNavigationSetView page={ page } pendingTree={ pendingTree } setPendingTree={ setPendingTree } />
                </div> }
        </div>
    );
}
