import React from "react";
import { Setter } from "../global";

export function Control({ setter }: { setter: Setter<number> }) {
  const [checked, setChecked] = React.useState(true);
  const [input, setInput] = React.useState('{"code": "// this is a comment\\nint twelve = 12;\\nif (twelve != 42) {\\n  twelve = 42;\\n}", "errorRange": [2,5,2,11]}');

  const handleChange = () => {
    setChecked(!checked);
    setter.onRender(!checked);
  };

  // set input on initial render
  React.useEffect(() => {
    try {
      console.log('on initial render')
      setter.onInput(JSON.parse(input));
    } catch (e) {
      console.error(e);
    }
  }, [])

  return (
    <div>
      <span>
        Render: <Checkbox value={checked} onChange={handleChange} />
      </span>
      <div>
        Input:
        <textarea
          value={input}
          onChange={(e) => {
            try {
              setInput(e.target.value);
              setter.onInput(JSON.parse(e.target.value));
            } catch (e) {
              console.error(e);
            }
          }}
        />
      </div>
    </div>
  );
}

const Checkbox = ({ value, onChange }) => {
  return (
    <label>
      <input type="checkbox" checked={value} onChange={onChange} />
    </label>
  );
};
