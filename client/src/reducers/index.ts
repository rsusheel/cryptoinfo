import { combineReducers } from 'redux';
import coinReducer from './coinReducer';

const rootReducer = combineReducers({
  data: coinReducer
});

export default rootReducer;
