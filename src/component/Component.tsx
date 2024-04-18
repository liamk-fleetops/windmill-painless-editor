import {useEffect, useRef, useState} from "react";
import "./component.css";
import React from "react";
import { Setter } from "../global";
import * as monaco from 'monaco-editor';
import Editor, { loader } from '@monaco-editor/react';
import './painless'
import PainlessWorker from './worker/painless.worker.ts?worker';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'


loader.config({ monaco });

self.MonacoEnvironment = {
    getWorker: function (moduleId: string, label: string) : any {
      console.log("get worker", moduleId, label)
      switch (label) {
        case 'json':
          return new JsonWorker()
        case 'painless':
          return new PainlessWorker()
        default:
          return new EditorWorker()
      }
    }
};

type Input = any;

function Component({
  passSetters,
  setOutput,
  renderInit,
}: {
  passSetters: (setter: Setter<Input>) => void;
  setOutput: (output: any) => void;
  renderInit: boolean;
}) {
  const [render, setRender] = useState(renderInit);
  const [state, setState] = useState({ code: "", errorRange: []});
  const monacoObjects = useRef({} as any);

  useEffect(() => {
    passSetters({
      onInput: (inputState) => {
        const newState: any = {...state}
        if (inputState.code) {
          newState.code = inputState.code
        }
        if (inputState.errorRange) {
          newState.errorRange = inputState.errorRange
        }
        setState(newState)
      },
      onRender: setRender,
    });
    setState({...state, code: "int hello = 42;"})
  }, [setRender, setState, passSetters]);


  useEffect(() => {
    if (state.errorRange == undefined || state.errorRange.length != 4) return;
    if (monacoObjects.current == undefined || monacoObjects.current.editor == undefined) return;
    const { monaco, editor } = monacoObjects.current;

    editor.deltaDecorations(
      [],
      [
        {
          range: new monaco.Range(...state.errorRange),
          options: {
            inlineClassName: "error_highlight",
          },
        },
      ]
    );
  }, [state.code, state.errorRange]);

  function changeHandler(value: string|undefined) {
    if (value == undefined) return
    setState({...state, code: value})
    setOutput(value)
  }

  function editorDidMount (editor: any, monaco: any) {
    monacoObjects.current = {
      editor,
      monaco,
    }
  }

  if (!render) {
    return <></>;
  }

  return (
    <>
      <h1>Painless Editor</h1>
      <div>
        State: <pre>{JSON.stringify(state)}</pre>
      </div>
      <Editor
        height="20vh"
        width="400px"
        language="painless"
        onChange={changeHandler}
        onMount={editorDidMount}
        value={state.code} />
    </>
  );
}

export default Component;
