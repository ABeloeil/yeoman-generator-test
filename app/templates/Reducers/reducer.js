import {combineReducer} from 'redux'
import appReducer from './appReducer'
<%- imports %>

const reducer = combineReducer({
    app: appReducer, <%- reducers %>
});

export default reducer;
