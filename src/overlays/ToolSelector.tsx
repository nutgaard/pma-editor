import Overlay from "../components/Overlay.tsx";
import {Dispatch, SetStateAction, useEffect} from "react";
import css from './ToolSelector.module.css';
import clsx from "clsx";

export type Tool = 'pointer' | 'colorpicker' | 'rectangle';
export type Color = [number, number, number];
interface Props {
    color: [Color, Dispatch<SetStateAction<Color>>]
    tool: [Tool, Dispatch<SetStateAction<Tool>>]
}

export default function ToolSelector(props: Props) {
    const [tool, setTool] = props.tool;
    const [[r,g,b]] = props.color;
    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (event.code === 'KeyP' || event.code === 'Escape') {
                setTool('pointer');
            }
            else if (event.code === 'KeyC') {
                setTool('colorpicker');
            }
            else if (event.code === 'KeyR') {
                setTool('rectangle');
            }
        };
        document.addEventListener('keyup', handler);
        return () => document.removeEventListener('keyup', handler);
    }, [setTool]);
    return (
        <Overlay className={css.overlay}>
            <h1>Mask Image</h1>
            <p>Remove details from image.</p>

            <p className={css.colorbox}><strong>Color:</strong><span style={{backgroundColor: `rgb(${r},${g},${b})`}} /></p>
            <div className={css.toolbox}>
                <button
                    className={clsx(css.tool, tool === 'pointer' ? css.selected : '')}
                    onClick={() => setTool('pointer')}
                >
                    P
                </button>
                <button
                    className={clsx(css.tool, tool === 'colorpicker' ? css.selected : '')}
                    onClick={() => setTool('colorpicker')}
                >
                    C
                </button>
                <button
                    className={clsx(css.tool, tool === 'rectangle' ? css.selected : '')}
                    onClick={() => setTool('rectangle')}
                >
                    R
                </button>
            </div>

            <button className={css.done}>DONE</button>
        </Overlay>
    );
}