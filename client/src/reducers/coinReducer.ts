const initialState = {
    selectedCoin: null,
    coinsDetails: [],
    dropdownVisibility: false
};

const coinReducer = (state = initialState, action: { type: any; payload: any; }) => {
  switch (action.type) {
    case 'SET_SELECTED_COIN':
      return {
        ...state,
        selectedCoin: action.payload
      }

    case 'SET_COINS_DETAILS':
        return {
            ...state,
            coinsDetails: action.payload
        }

    case 'TOGGLE_DROPDOWN':
        return {
            ...state,
            dropdownVisibility: !state.dropdownVisibility
        }

    default:
      return state;
  }
};

export default coinReducer;