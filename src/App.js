import React, { useEffect, useState } from 'react';
import { from, BehaviorSubject } from 'rxjs';
import {
  filter,
  mergeMap,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';

const getPokemonByName = async name => {
  const { results: allPokemons } = await fetch(
    'https://pokeapi.co/api/v2/pokemon/?limit=1000'
  ).then(res => res.json());
  return allPokemons.filter(pokemon => pokemon.name.includes(name));
};

const searchSubject = new BehaviorSubject('');
const searchResultObservable = searchSubject.pipe(
  filter(srt => srt.length > 1),
  debounceTime(750),
  distinctUntilChanged(),
  mergeMap(val => from(getPokemonByName(val)))
);

// const numbersObservable = from([1, 2, 3, 4, 5, 6, 7, 8, 9]);
// const squaredNumbers = numbersObservable.pipe(
//   filter(val => val > 3),
//   mergeMap(val => from([val]).pipe(delay(1000 * val))),
//   map(val => val * val)
// );

const useObservable = (observable, setter) => {
  useEffect(() => {
    const subscribetion = observable.subscribe(result => setter(result));

    return () => subscribetion.unsubscribe();
  }, [observable, setter]);
};

const App = () => {
  // const [currentNumber, setCurrentNumber] = useState(0);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);

  useObservable(searchResultObservable, setResults);
  // useObservable(squaredNumbers, setCurrentNumber);

  const handleSearchChange = e => {
    const newValue = e.target.value;
    setSearch(newValue);
    searchSubject.next(newValue);
  };

  return (
    <div>
      <input
        type="text"
        autoFocus
        placeholder="Search"
        value={search}
        onChange={handleSearchChange}
      />
      <div>
        {results.map(pokemon => (
          <div key={pokemon.name}>{pokemon.name}</div>
        ))}
      </div>
    </div>
  );
};

export default App;
