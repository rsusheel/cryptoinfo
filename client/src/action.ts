export const setSelectedCoin = (data: any) => ({
    type: 'SET_SELECTED_COIN',
    payload: data,
  });

export const setCoinsDetails = (data: any) => ({
    type: 'SET_COINS_DETAILS',
    payload: data,
})

export const toggleDropdown = () => ({
    type: 'TOGGLE_DROPDOWN'
})