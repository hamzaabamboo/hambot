import React from 'react';
import './css/tailwind.css';

const App = props => {
  // yes, this `props` contains data passed from the server
  // and also we can inject additional data into pages
  const { children, ...rest } = props;

  // we can wrap this PageComponent for persisting layout between page changes
  const PageComponent = children;

  return <PageComponent {...rest} />;
};

export default App;
