import { useState, useImperativeHandle, forwardRef } from 'react';

const Toast = forwardRef(function Toast(_, ref) {
  const [state, setState] = useState({ msg: '', type: '', show: false });

  useImperativeHandle(ref, () => ({
    show(msg, type = '') {
      setState({ msg, type, show: true });
      setTimeout(() => setState(s => ({ ...s, show: false })), 3000);
    }
  }));

  return (
    <div className={`toast${state.type ? ` ${state.type}` : ''}${state.show ? ' show' : ''}`}>
      {state.msg}
    </div>
  );
});

export default Toast;
