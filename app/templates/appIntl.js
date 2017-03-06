import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {configureStore} from './Stores/configureStore'
import App from './Components/App'
import {IntlProvider, addLocaleData} from 'react-intl'
import en from 'react-intl/locale-data/en'
import fr from 'react-intl/locale-data/fr'
import localeData from './Translations/translation.json'

addLocaleData([...en, ...fr]);

const node = document.getElementById('app');
const locale = node.getAttribute('data-locale');
const messages = localeData[locale];


render(
    <IntlProvider locale={locale} messages={messages}>
        <Provider store={configureStore()}>
            <App/>
        </Provider>
    </IntlProvider>, node
);
