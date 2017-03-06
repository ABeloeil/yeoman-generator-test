import {createStore, applyMiddleware} from 'redux'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
<%- reducer %>
//import your own action here


export const configureStore = () => {
    let middlewares = [thunkMiddleware];

    if (process.env.NODE_ENV !== 'production') {
        let loggerMiddleware = createLogger({
            collapsed: true,
            diff: true,
            duration: true,
        });
        middlewares = [...middlewares, loggerMiddleware]
    }

    let store = createStore(
        surveyReducer,
        applyMiddleware(...middlewares)
    );

    //Dispatch your own action here

    return store;
};
