import {useCallback, useEffect, useRef, useState, KeyboardEvent, Dispatch, SetStateAction} from "react";
import Konva from "konva";
import { Shape, Layer, Stage, Image, Rect, Line } from "react-konva";
import css from './Editor.module.css';
import {useAppState} from "../useAppState.tsx";
import {Vector2d} from "konva/lib/types";
import { Selection } from './../useAppState.tsx';
import {CropImage} from "../overlays/CropImage.tsx";
import ToolSelector, {Color, Tool} from "../overlays/ToolSelector.tsx";

// 0=left,1=middle,2=right
Konva.dragButtons = [0];
const scaleBy = 1.05;

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
    color: Color;
}

export default function Editor() {
    const appState = useAppState();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const [size, setSize] = useState({width: 100, height: 100});
    const selectionState = useState<Selection>({ top: 100, bottom: 100, left: 100, right: 100 });
    const selectedState = useState<Selected>(null);
    const toolState = useState<Tool>('pointer');
    const colorState = useState<Color>([36, 36, 36]);
    const [selected] = selectedState;
    const [,setSelection] = selectionState;
    const [,setColor] = colorState;
    const [tool] = toolState;
    const [color] = colorState;
    const [masks, setMasks] = useState<Array<Rect>>([]);

    useEffect(() => {
        if (wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect()
            setSize({width: rect.width, height: rect.height});
        }
    }, [wrapperRef]);
    useEffect(() => {
        if (appState.state.croppedUrl) {
            appState.state.croppedUrl.then((cropped) => {
                const image = new window.Image();
                image.src = cropped;
                image.addEventListener('load', () => {
                    setImage(image);
                })
            })
        } else if (appState.state.url) {
            const image = new window.Image();
            image.src = appState.state.url;
            image.addEventListener('load', () => {
                setImage(image);
            })
        }
    }, [appState.state.url, appState.state.croppedUrl]);

    const zoomHandler = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        if (stageRef.current) {
            const stage = stageRef.current;
            const oldScale = stage.scaleX();
            const { x: pointerX, y: pointerY } = stage.getPointerPosition()!;
            const mousePointTo = {
                x: (pointerX - stage.x()) / oldScale,
                y: (pointerY - stage.y()) / oldScale,
            };
            const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
            stage.scale({ x: newScale, y: newScale });
            const newPos = {
                x: pointerX - mousePointTo.x * newScale,
                y: pointerY - mousePointTo.y * newScale,
            }
            stage.position(newPos);
            stage.batchDraw();
        }
    }, []);

    const handleKeyPress = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
        const size = event.shiftKey ? 5 : 1;
        if (selected === 't' && event.code === 'ArrowUp') {
            setSelection(c => ({...c, top: c.top - size }))
        } else if (selected === 't' && event.code === 'ArrowDown') {
            setSelection(c => ({...c, top: c.top + size }))
        } else if (selected === 'b' && event.code === 'ArrowUp') {
            setSelection(c => ({...c, bottom: c.bottom + size }))
        } else if (selected === 'b' && event.code === 'ArrowDown') {
            setSelection(c => ({...c, bottom: c.bottom - size }))
        } else if (selected === 'l' && event.code === 'ArrowRight') {
            setSelection(c => ({...c, left: c.left + size }))
        } else if (selected === 'l' && event.code === 'ArrowLeft') {
            setSelection(c => ({...c, left: c.left - size }))
        } else if (selected === 'r' && event.code === 'ArrowRight') {
            setSelection(c => ({...c, right: c.right - size }))
        } else if (selected === 'r' && event.code === 'ArrowLeft') {
            setSelection(c => ({...c, right: c.right + size }))
        }
    },[selected, setSelection])
    console.log(masks);
    return (
        <>
            <div className={css.canvasWrapper}>
                {appState.state.mode === 'CROP' && <CropImage selection={selectionState[0]} />}
                {appState.state.mode === 'MASK' && <ToolSelector tool={toolState} color={colorState} />}
                <div className={css.canvas} ref={wrapperRef} tabIndex={-1} onKeyDown={handleKeyPress}>
                    <Stage
                        width={size.width}
                        height={size.height}
                        ref={stageRef}
                        onWheel={zoomHandler}
                        draggable
                        onClick={e => {
                            const stage = e.currentTarget.getStage();
                            const position = stage?.getPointerPosition();
                            if (!position) {
                                return;
                            }
                            const {x, y} = position;
                            if (tool === 'colorpicker') {
                                const color = wrapperRef
                                    .current
                                    ?.querySelector('canvas')
                                    ?.getContext('2d')
                                    ?.getImageData(x, y, 1, 1);
                                if (color) {
                                    setColor([color.data[0], color.data[1], color.data[2]]);
                                }
                            } else if (tool === 'rectangle') {
                                setMasks(c => c?.concat({
                                    x,
                                    y,
                                    width: 100,
                                    height: 100,
                                    color
                                }))
                            }
                        }}
                    >
                        <Layer>
                            {image instanceof HTMLImageElement ? <Image image={image} />: null }
                        </Layer>
                        {image && appState.state.mode === 'CROP' && <CropRect width={image.width} height={image.height} selection={selectionState} selected={selectedState} /> }
                        <Layer>
                            {masks?.map((mask, i) => (
                                <Rect
                                    key={i}
                                    x={mask.x}
                                    y={mask.y}
                                    width={mask.width}
                                    height={mask.height}
                                    fill={`rgb(${mask.color[0]},${mask.color[1]},${mask.color[2]})`}
                                />
                            ))}
                        </Layer>
                    </Stage>
                </div>
            </div>
        </>

    )
}
const strokeRadius = 4;
type Selected = 't'|'b'|'l'|'r'|null;
interface CropRectProps {
    width: number;
    height: number;
    selection: [Selection, Dispatch<SetStateAction<Selection>>];
    selected: [Selected, Dispatch<SetStateAction<Selected>>];
}
function CropRect(props: CropRectProps) {
    const [selection, setSelection] = props.selection;
    const [selected, setSelected] = props.selected;
    const handleClick = (direction: 't'|'b'|'l'|'r'|null) => (event: Konva.KonvaEventObject<MouseEvent>) => {
        event.cancelBubble = true;
        setSelected(direction);
    }

    return (
        <Layer>
            <Shape
                sceneFunc={(context, shape) => {
                    context.beginPath();
                    context.moveTo(0, 0);
                    context.lineTo(props.width, 0);
                    context.lineTo(props.width, props.height);
                    context.lineTo(0, props.height);

                    context.moveTo(selection.left, selection.top);
                    context.lineTo(selection.left, props.height - selection.bottom);
                    context.lineTo(props.width - selection.right, props.height - selection.bottom);
                    context.lineTo(props.width - selection.right, selection.top);
                    context.closePath();

                    context.fillStrokeShape(shape);
                }}
                fill="#00000032"
            />
            <Rect
                x={0}
                y={0}
                width={props.width}
                height={props.height}
                onClick={() => setSelected(null)}
            />
            <GrabLine
                x0={0} y0={selection.top}
                x1={props.width} y1={selection.top}
                onClick={handleClick('t')}
                selected={selected === 't'}
                dragBoundFunc={pos => ({x: 0, y: pos.y})}
                onChange={(_, y) => setSelection(c => ({...c, top: y}))}
            />
            <GrabLine
                x0={0} y0={props.height - selection.bottom}
                x1={props.width} y1={props.height - selection.bottom}
                onClick={handleClick('b')}
                selected={selected === 'b'}
                dragBoundFunc={pos => ({x: 0, y: pos.y})}
                onChange={(_, y) => setSelection(c => ({...c, bottom: props.height - y}))}
            />
            <GrabLine
                x0={selection.left} y0={0}
                x1={selection.left} y1={props.height}
                onClick={handleClick('l')}
                selected={selected === 'l'}
                dragBoundFunc={pos => ({x: pos.x, y: 0})}
                onChange={(x) => setSelection(c => ({...c, left: x}))}
            />
            <GrabLine
                x0={props.width - selection.right} y0={0}
                x1={props.width - selection.right} y1={props.height}
                onClick={handleClick('r')}
                selected={selected === 'r'}
                dragBoundFunc={pos => ({x: pos.x, y: 0})}
                onChange={(x) => setSelection(c => ({...c, right: props.width - x}))}
            />
        </Layer>
    );
}

interface GrabLineProps {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    selected?: boolean;
    onClick(event: Konva.KonvaEventObject<MouseEvent>): void;
    dragBoundFunc?(pos: Vector2d): Vector2d
    onChange?(x: number, y: number): void;
}
function GrabLine(props: GrabLineProps) {
    const { x0, y0, x1, y1, onClick, selected } = props;
    return (
        <>
            <Line
                points={[x0, y0, x1, y1]}
                strokeWidth={2}
                stroke={selected ? 'black' : 'darkgray'}
                dash={[8, 4]}
            />
            <Rect
                draggable
                onMouseDown={onClick}
                x={x0 - strokeRadius}
                y={y0 - strokeRadius}
                width={(x1 - x0) + 2 * strokeRadius}
                height={(y1 - y0) + 2 * strokeRadius}
                strokeWidth={2}
                dragBoundFunc={props.dragBoundFunc}
                onDragMove={(e) => {
                    e.cancelBubble = true;
                    props.onChange && props.onChange(e.currentTarget.x(), e.currentTarget.y());
                }}
            />
        </>
    );
}