import ReactDOM from 'react-dom';

const Portal = ({
  children,
  root = 'modal-root',
}: {
  children: React.ReactNode;
  root?: string;
}) => {
  let modalRoot = document.getElementById(root);

  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = root;
    document.body.appendChild(modalRoot);
  }

  return ReactDOM.createPortal(children, modalRoot);
};

export default Portal;
