import Overlay from "../components/Overlay";
import css from './CropImage.module.css';
import {Selection, useAppState} from "../useAppState.tsx";

export function CropImage(props: {selection: Selection}) {
    const appState = useAppState();
    return (
        <Overlay className={css.overlay}>
            <h1>Crop Image</h1>
            <p>Make a square on the image to select which portions to continue to work with.</p>

            <button className={css.done} onClick={() => appState.actions.crop(props.selection)}>DONE</button>
        </Overlay>
    );
}