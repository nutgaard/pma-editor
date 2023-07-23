import {ReactNode, createContext, useCallback, useMemo, useReducer, useContext} from "react";
import {cropImage} from "./image-utils.ts";

type Actions = ImageSelected | CropComplete;

interface ImageSelected {
    type: 'image_selected';
    file: File;
}
interface CropComplete {
    type: 'crop_completed';
    selection: Selection;
}

function reducer(state: State, action: Actions): State {
    console.log('action', action);
    switch (action.type) {
        case "image_selected": return { ...state, mode: 'CROP', file: action.file, url: URL.createObjectURL(action.file) }
        case "crop_completed": return { ...state, mode: 'MASK', selection: action.selection, croppedUrl: cropImage(state.url!, action.selection) }
    }
}

interface State {
    mode: 'SELECT_IMAGE' | 'CROP' | 'MASK' | 'PLACE' | 'SAVE';
    file?: File;
    url?: string;
    croppedUrl?: Promise<string>;
    selection?: Selection;
}

export interface Selection {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

interface AppState {
    state: State;
    actions: {
        selectImage(file: File): void;
        crop(selection: Selection): void;
    }
}


function useAppStateReducer(): AppState {
    const [state, dispatch] = useReducer(reducer, { mode: 'SELECT_IMAGE' });

    const selectImage = useCallback((file: File) => {
        dispatch({ type: 'image_selected', file })
    }, [dispatch])

    const crop = useCallback((selection: Selection) => {
        dispatch({ type: 'crop_completed', selection })
    }, [dispatch])

    const actions = useMemo(() => ({ selectImage, crop }), [selectImage, crop])

    return {
        state,
        actions,
    };
}

const AppStateContext = createContext<AppState>({state: {}} as AppState)

export function AppStateProvider(props: { children: ReactNode }) {
    const appstate = useAppStateReducer();
    return (
        <AppStateContext.Provider value={appstate}>
            {props.children}
        </AppStateContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppState(): AppState {
    return useContext(AppStateContext);
}