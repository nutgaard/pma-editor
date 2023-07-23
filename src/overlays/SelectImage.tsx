import Overlay from "../components/Overlay.tsx";
import css from './SelectImage.module.css';
import {ChangeEvent, MouseEvent, DragEvent, RefObject, useCallback, useMemo, useRef, useState} from "react";
import clsx from "clsx";
import {useAppState} from "../useAppState.tsx";

interface ContentProps {
    file?: File | null;
    setFile(file?: File): void;
    input: RefObject<HTMLInputElement>;
}

function Content(props: ContentProps) {
    const appState = useAppState();
    const { file, setFile, input } = props;
    const removeHandler = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (input.current) {
            input.current.value = '';
        }
        setFile(undefined);
    }, [setFile, input])
    const dataUrlForFile = useMemo(() => {
        if (file) {
            return URL.createObjectURL(file)
        } else {
            return undefined;
        }
    }, [file])

    if (file) {
        return (
            <>
                <img src={dataUrlForFile}/>
                <div>
                    <button onClick={removeHandler}>Remove</button>
                    <button onClick={() => appState.actions.selectImage(file)}>Edit photo</button>
                </div>
            </>
        );
    } else {
        return (
            <>
                <strong>Choose a file</strong><span> or drag it here</span>
            </>
        );
    }
}


export default function SelectImage() {
    const [file, setFile] = useState<File | undefined | null>(undefined);
    const [isHighlight, setHighlight] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const changeHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.target?.files?.item(0);
        setFile(file);
    }, []);
    const highlight = useCallback((e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setHighlight(true);
    }, []);
    const unhighlight = useCallback((e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setHighlight(false);
    }, []);
    const dropHandler = useCallback((e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setHighlight(false);
        const file = e.dataTransfer.files.item(0);
        setFile(file);
    }, [setHighlight, setFile]);

    return (
        <Overlay fullscreen center className={css.overlay}>
            <form>
                <h1>Select image</h1>
                <label
                    className={clsx(css.dragcontainer, isHighlight ? css.highlight : '')}
                    onDragEnter={highlight}
                    onDragOver={highlight}
                    onDragLeave={unhighlight}
                    onDrop={dropHandler}
                >
                    <Content file={file} setFile={setFile} input={inputRef} />
                    <input type="file" ref={inputRef} onChange={changeHandler}/>
                </label>
            </form>
        </Overlay>
    );
}