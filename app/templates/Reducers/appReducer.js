import {updateObject, updateItemInArray, createReducer} from 'reducer-utilities'
import * as ActionTypes from '../Constants/ActionTypes'

const reducer = createReducer({}, {
    //add you own functions for your reducer
    //eg: [ActionTypes.ADD_TODO]: addTodo
});

//const addTodo = (state, action) => return updateObject(state, action.todo);

export default reducer;
