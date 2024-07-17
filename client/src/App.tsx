import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import moment from 'moment';
import SearchDropdown from './SearchDropdown';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedCoin, setCoinsDetails, toggleDropdown } from './action';
import { getData } from './selectors';

function App() {

  const dispatch = useDispatch();
  const data = useSelector(getData);

  // const [isDropdownVisible, setDropdownVisible] = useState(false);

  const displayPopup = (coin: React.SetStateAction<never[]>) => {
    // setDropdownVisible(true);
    dispatch(toggleDropdown());
    dispatch(setSelectedCoin(coin));
  };

  useEffect(() => {
    const fetchStockPrices = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/refresh');
        dispatch(setCoinsDetails(response.data));
        // console.log(stocks)
      } catch (error) {
        console.error('Error fetching stocks:', error);
      }
    };

    fetchStockPrices();

    const interval = setInterval(fetchStockPrices, 10000);
    return () => clearInterval(interval);
  }, [])

  return (
    <div className="App">
      <h1>Real-time Crypto Prices</h1>
      <h4>Hover on the table and click on the row you wish to change</h4>
      <table className='coin-table'>
        <thead>
          <tr>
            <th>Serial</th>
            <th className='name-heading'>Name</th>
            <th>Symbol</th>
            <th>Price (USD)</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {data.coinsDetails.map((coin: any) => (
            <tr key={coin._id} onClick={()=> {displayPopup(coin)}} className='table-row'>
              <td className='table-serial'>{coin.serial}</td>
              <td className='table-name'>{coin.name}</td>
              <td className='table-symbol'>{coin.symbol}</td>
              <td className='table-price'>{coin.price.toFixed(2)}</td>
              <td className='table-time'>{moment(coin.last_updated_at).format('LT')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.dropdownVisibility && <SearchDropdown className='search-dropdown'/>}
      {data.dropdownVisibility && <div className='search-bg' onClick={()=>{dispatch(toggleDropdown())}}></div>}
    </div>
  );
}

export default App;
