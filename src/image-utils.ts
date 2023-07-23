import {Selection} from "./useAppState.tsx";

export function cropImage(imagePath: string, selection: Selection): Promise<string> {
    return new Promise((resolve) => {
        const image = new Image();
        image.src = imagePath;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        image.addEventListener('load', () => {
            const newWidth = image.width - selection.left - selection.right;
            const newHeight = image.height - selection.top - selection.bottom;
            canvas.width = newWidth;
            canvas.height = newHeight;
            ctx?.drawImage(image, selection.left, selection.top, newWidth, newHeight, 0, 0, newWidth, newHeight);

            resolve(canvas.toDataURL('image/png', 0.9));
        });
    });
}