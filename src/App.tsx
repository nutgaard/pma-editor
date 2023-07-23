import css from './App.module.css'
import gitubIcon from './github.svg';
import Editor from "./components/Editor.tsx";
import Overlays from "./overlays/Overlays.tsx";
import { AppStateProvider } from "./useAppState.tsx";

function App() {
  return (
    <div className={css.app}>
        <header className={css.header}>
            <h1>PMA Editor</h1>
            <a href="https://github.com/nutgaard/pma-editor" target="_blank">
                <img src={gitubIcon} alt=""/>
            </a>
        </header>
        <AppStateProvider>
            <main className={css.main}>
                <Editor />
                <Overlays />
            </main>
        </AppStateProvider>
    </div>
  )
}

export default App
