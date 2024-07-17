import axios from 'axios';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { getData } from './selectors';
import { useDispatch } from 'react-redux';
import { toggleDropdown } from './action';
import { coinData } from './CoinData';

interface Coin {
    id: string;
    symbol: string;
    name: string;
  }
  
  interface SearchDropdownProps {
    data: Coin[];
  }

function SearchDropdown({selectedCoin}: any) {

    const data = useSelector(getData);
    const dispatch = useDispatch();

    const changeCoin = async (new_id: any) => {
        try {
            const body_data = {
                old_id: data.selectedCoin.id,
                new_id: new_id,
                serial: data.selectedCoin.serial
            }
            console.log(body_data)
            const response = await axios.post('http://localhost:3001/api/change', body_data);
            dispatch(toggleDropdown());
          } catch (error) {
            console.error('Error fetching stocks:', error);
          }
    }

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(coinData);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = coinData.filter((item: { name: string; symbol: string; }) => (
      item.name.toLowerCase().includes(query) ||
      item.symbol.toLowerCase().includes(query)
    ));

    setFilteredData(filtered);
  };

  const placeholder = 'Replace "'+data.selectedCoin.name+'" with...'

  return (
    <div className='search-dropdown'>
      <input
        className='input-field'
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleSearch}
      />
      <div className='coin-list'>
        {filteredData.map((item: { id: React.Key | null | undefined; name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; symbol: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) => (
          <div className='coin-item' key={item.id} onClick={() => {changeCoin(item.id)}}>{item.name} ({item.symbol})</div>
        ))}
      </div>
    </div>
  );
};

export default SearchDropdown;