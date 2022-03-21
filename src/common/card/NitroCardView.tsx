import { FC, useMemo } from 'react';
import { Column, ColumnProps } from '..';
import { DraggableWindow, DraggableWindowPosition, DraggableWindowProps } from '../draggable-window';
import { NitroCardContextProvider } from './NitroCardContext';

export interface NitroCardViewProps extends DraggableWindowProps, ColumnProps
{
    theme?: string;
}

export const NitroCardView: FC<NitroCardViewProps> = props =>
{
    const { theme = 'primary', uniqueKey = null, handleSelector = '.drag-handler', windowPosition = DraggableWindowPosition.CENTER, disableDrag = false, overflow = 'hidden', position = 'relative', gap = 0, classNames = [], offsetLeft = 0, offsetTop = 0, ...rest } = props;

    const getClassNames = useMemo(() =>
    {
        const newClassNames: string[] = [ 'nitro-card', 'rounded', 'shadow', ];

        newClassNames.push(`theme-${ theme || 'primary' }`);

        if(classNames.length) newClassNames.push(...classNames);

        return newClassNames;
    }, [ theme, classNames ]);

    return (
        <NitroCardContextProvider value={ { theme } }>
            <DraggableWindow uniqueKey={uniqueKey} handleSelector={handleSelector} windowPosition={windowPosition} disableDrag={disableDrag} offsetLeft={offsetLeft} offsetTop={ offsetTop }>
                <Column overflow={ overflow } position={ position } gap={ gap } classNames={ getClassNames } { ...rest } />
            </DraggableWindow>
        </NitroCardContextProvider>
    );
}
