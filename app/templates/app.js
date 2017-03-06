import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {configureStore} from './Stores/configureStore'
import App from './Components/App'

const node = document.getElementById('app');

render(
    <Provider store={configureStore()}>
        <App/>
    </Provider>, node
);
