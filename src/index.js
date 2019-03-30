import React from 'react';
import ReactDOM from 'react-dom';
import App from './AppHooks';
import 'semantic-ui-css/semantic.min.css'
import * as serviceWorker from './serviceWorker';
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);

ReactDOM.render(<App />, document.getElementById('root'));


serviceWorker.unregister();
