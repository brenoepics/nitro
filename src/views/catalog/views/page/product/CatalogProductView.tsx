import { FurnitureType } from 'nitro-renderer';
import { FC, useMemo } from 'react';
import { GetRoomEngine, GetSessionDataManager } from '../../../../../api';
import { GetConfiguration } from '../../../../../utils/GetConfiguration';
import { AvatarImageView } from '../../../../avatar-image/AvatarImageView';
import { LimitedEditionStyledNumberView } from '../../../../limited-edition/styled-number/LimitedEditionStyledNumberView';
import { ProductTypeEnum } from '../../../enums/ProductTypeEnum';
import { CatalogProductViewProps } from './CatalogProductView.types';

export const CatalogProductView: FC<CatalogProductViewProps> = props =>
{
    const { isActive = false, product = null, onMouseEvent = null } = props;

    const iconUrl = useMemo(() =>
    {
        if(!product) return null;

        const productType = product.productType.toUpperCase();

        switch(productType)
        {
            case FurnitureType.BADGE:
                return GetSessionDataManager().getBadgeUrl(product.extraParam);
            case FurnitureType.ROBOT:
                return null;
            case FurnitureType.FLOOR:
                return GetRoomEngine().getFurnitureFloorIconUrl(product.furniClassId);
            case FurnitureType.WALL: {
                const furniData = GetSessionDataManager().getWallItemData(product.furniClassId);
                
                let iconName = '';

                if(furniData)
                {
                    switch(furniData.className)
                    {
                        case 'floor':
                            iconName = ['th', furniData.className, product.extraParam].join('_');
                            break;
                        case 'wallpaper':
                            iconName = ['th', 'wall', product.extraParam].join('_');
                            break;
                        case 'landscape':
                            iconName = ['th', furniData.className, product.extraParam.replace('.', '_'), '001'].join('_');
                            break;
                    }

                    if(iconName !== '')
                    {
                        const assetUrl = GetConfiguration<string>('catalog.asset.url');

                        return `${ assetUrl }/${ iconName }.png`;
                    }
                }

                return GetRoomEngine().getFurnitureWallIconUrl(product.furniClassId, product.extraParam);
            }
        }

        return null;
    }, [ product ]);

    if(!product) return null;

    const imageUrl = (iconUrl && iconUrl.length) ? `url(${ iconUrl })` : null;

    return (
        <div className="col pe-1 pb-1 catalog-offer-item-container">
            <div className={ 'position-relative border border-2 rounded catalog-offer-item cursor-pointer ' + (isActive ? 'active ' : '') + (product.uniqueLimitedItem ? 'unique-item ' : '') + ((product.uniqueLimitedItem && !product.uniqueLimitedItemsLeft) ? 'sold-out ' : '') } style={ { backgroundImage: imageUrl }} onClick={ onMouseEvent }>
                { !imageUrl && (product.productType === ProductTypeEnum.ROBOT) &&
                    <AvatarImageView figure={ product.extraParam } direction={ 3 } headOnly={ true } /> }
                { (product.productCount > 1) && <span className="position-absolute badge border bg-danger px-1 rounded-circle">{ product.productCount }</span> }
                { product.uniqueLimitedItem && 
                    <div className="position-absolute unique-item-counter">
                        <LimitedEditionStyledNumberView value={ product.uniqueLimitedSeriesSize } />
                    </div> }
            </div>
        </div>
    );
}