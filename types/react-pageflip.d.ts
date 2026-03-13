declare module 'react-pageflip' {
  import * as React from 'react';

  export interface IFlipSetting {
    width: number;
    height: number;
    size?: 'fixed' | 'stretch';
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    swipeDistance?: number;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
    startPage?: number;
    style?: React.CSSProperties;
    className?: string;
    onFlip?: (e: any) => void;
    onChangeOrientation?: (e: any) => void;
    onChangeState?: (e: any) => void;
  }

  export interface IBookProps extends IFlipSetting {
    children: React.ReactNode;
  }

  const HTMLFlipBook: React.ForwardRefExoticComponent<IBookProps & React.RefAttributes<any>>;
  export default HTMLFlipBook;
}