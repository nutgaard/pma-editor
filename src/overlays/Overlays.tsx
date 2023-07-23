import SelectImage from "./SelectImage.tsx";
import {useAppState} from "../useAppState.tsx";

export default function Overlays() {
    const appState = useAppState();
    const mode = appState.state.mode;
    if (mode === 'SELECT_IMAGE') {
        return (<SelectImage />);
    } else if (mode === 'CROP') {
        return null;
        // return (<CropImage />);
    }
}