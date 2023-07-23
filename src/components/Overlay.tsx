import {ReactNode} from "react";
import clsx from 'clsx';
import css from './Overlay.module.css';

interface Props {
    className?: string;
    children: ReactNode;
    fullscreen?: boolean;
    center?: boolean;
}

export default function Overlay(props: Props) {
    const fullscreen = props.fullscreen ?? false;
    const center = props.center ? css.center : '';

    return (
        <div className={clsx(css.overlay)}>
            {fullscreen ? <div className={css.mask} /> : null}
            <div className={clsx(css.content, center, props.className)}>
                {props.children}
            </div>
        </div>
    );
}