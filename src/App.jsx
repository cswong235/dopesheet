import { useState, useEffect } from 'react';
import parse from 'html-react-parser';
import { Badge, Button, Row, Col, Container, Card } from 'react-bootstrap';
import Header from './components/Header';
import placeholder from './assets/Placeholder.png';
import './App.css';

export default function App(){
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [error, setError] = useState('');

  async function fetchMovies() {
    // Attempt to fetch movies from the API link
    const response = await fetch(`https://api.tvmaze.com/search/shows?q=${search}`);
    // Throw an error if the fetch didn't return an "ok" response
    if (!response.ok) {
      throw new Error(`Something went wrong when fetching data, please try again later (${response.status}).`);
    }
    // If successful, parse the response into a JSON format and return it
    const data = await response.json();
    return data;
  }

  async function fetchMoviesById() {
    const randomData = [];
    const usedIds = [];

    // Used for the "I'm feeling lucky" button for suggesting 4 random movies/shows
    // While there are under 4 movies/shows in the randomData array
    while(randomData.length < 4) {
      // Generate a random index number
      const rand = Math.floor(Math.random() * 10000);

      // If the index is already used or is 0, continue
      if (usedIds.includes(rand) || rand === 0){
        continue;
      }

      // Fetch random shows based on index number
      const response = await fetch(`https://api.tvmaze.com/shows/${rand}`);

      // If failed, push the index into the usedId so the error won't occur again
      if (!response.ok) {
        usedIds.push(rand);
        continue;
      }

      // Parse data into JSON
      const data = await response.json();

      // Push the data into randomData and its index into usedIds
      randomData.push(data);
      usedIds.push(rand);
    }
    return randomData;
  }


  useEffect(() => {
    // Start loading state to show loading screen
    setLoading(true);
    // Start debouncing, used to prevent calling the API on every keystroke and only call after the user stops typing after 1 second
    const getData = setTimeout(() => {
      // Fetch movies
      fetchMovies()
        // If successful, populate the result state with the fetched data
        .then((data) => {
          if (search) {
            // Only return data where the title of the movie includes the search term
            const searchedData = data.filter(d =>
              d.show.name.toLowerCase().includes(search.toLowerCase())
            );
            // Set the setResult state with the filtered data
            setResult(searchedData);
          } else {
            // Otherwise, display all data
            setResult(data);
          }
          // console.log(data);
        })
        // If failed, set the error state with the error message to display it
        .catch((error) => setError(error))
        // Whether successful or failed, turn off loading state
        .finally(() => setLoading(false));
      }, 1000
    )

    // Clean up debouncing
    return () => clearTimeout(getData);
  }, [search])

  async function randomize(){
    // Set loading to true
    setLoading(true);
    // Clear any previous fetched data to make way for the randomizer
    setResult([]);
    // Fetch movies by ID
    fetchMoviesById()
      .then((data) => setResult(data))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }

  return(
    <>
      <div className="masthead">
        <Header/>
      </div>
      <div className="film-strip"></div>

      <Container className="search-dock d-flex gap-3 p-3">
        <label className="search-field d-flex align-items-center w-75 px-3">
          <span className="me-2 fs-5">🔍</span>
          <input
            placeholder="Type in a show name here"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="search-input border-0"
          />
        </label>
        <Button variant="warning" className="btn-lucky ms-auto" onClick={randomize}>I'm feeling lucky</Button>
      </Container>

      <Container className="results-area mt-5 mb-5">
        <Badge bg="none" className="count-badge fs-5 mb-4">{result.length > 0 && !loading ? `${result.length} show${result.length === 1 ? '' : 's'} found` : ''}</Badge>
        <Row md={4} className="g-4">
          {loading ? (
            <Container className="state-panel w-100 p-4 d-flex flex-column align-items-center justify-content-center gap-3">
              <div className="spinner-border" role="status"></div>
              <span className="state-text">Loading...</span>
            </Container>
          ) : (
            !error ? (
              result && result.length ? (
                result.map(r => {
                // API data can be inconsistent, some embedded in a "show" object, some aren't
                // Used for ternary operations to check if it exists or not
                const id = r.show?.id || r.id;
                const image = r.show?.image || r.image;
                const name = r.show?.name || r.name;
                const genres = r.show?.genres || r.genres || [];
                const summary = r.show?.summary || r.summary || '';
                const imdbId = r.show?.externals?.imdb || r.externals?.imdb || '';
                const rating = r.show?.rating?.average || r.rating?.average || '';
                const year = r.show?.premiered || r.premiered || '';
                return <Col key={id}>
                  <Card className="show-card h-100">
                    <div className="poster-wrap">
                      {image ? (
                        <Card.Img
                          src={image.original ?? ''}
                          alt={`${name} movie poster`}
                          onError={(event) => event.target.src = placeholder}
                          className="poster-img w-100 object-fit-cover"
                        />
                      ) : (
                        <Card.Img
                          src={placeholder}
                          alt={`Placeholder image`}
                          className="poster-img w-100 object-fit-cover"
                        />
                      )}
                      {rating ? (
                        <div className="rating-stamp">
                          <strong>{rating}</strong>
                          <small>/10</small>
                        </div>
                      ) : (
                        ''
                      )}
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="show-title">{year ? `${name} (${year.slice(0, 4)})` : name}</Card.Title>
                      <div className="d-flex flex-row flex-wrap gap-2 mb-3">{genres.length > 0 ?
                        (genres.map(g => (
                          <Badge bg="none" className="genre-pill">{g}</Badge>
                        )))
                      :
                        ''
                      }</div>
                      <div className="summary mb-3">
                        {summary ? (parse(`${summary.slice(0, 350)}...`)) : ''}
                      </div>
                      {imdbId ? (
                        <div className="mt-auto">
                          <Button variant="dark" className="btn-imdb w-100" href={`https://www.imdb.com/title/${imdbId}/`}>View in IMDB</Button>
                        </div>
                      ) : (
                        ''
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              })) : (
                search.length ?
                  <Container className="state-panel w-100 p-4 d-flex flex-column align-items-center justify-content-center gap-2">
                    <span className="state-emoji">🎞️</span>
                    <h3 className="state-text m-0">No results. Try something else?</h3>
                  </Container>
                :
                  <Container className="state-panel w-100 p-4 d-flex flex-column align-items-center justify-content-center gap-2">
                    <span className="state-emoji">🍿</span>
                    <h3 className="state-text m-0">Welcome, type something in!</h3>
                  </Container>
              )
            ) : (
              <Container className="state-panel state-error w-100 p-4 d-flex flex-column align-items-center justify-content-center gap-2" role="alert">
                <span className="state-emoji">📼</span>
                <div className="state-text">{error.message}</div>
              </Container>
            )
          )}
        </Row>
      </Container>

      <div className="film-strip"></div>
      <Container fluid className="site-footer d-flex flex-row align-items-center justify-content-center p-3">
        <p className="m-0">Created by Wong Chang Sheng as part of Sigmaschool Mission 7</p>
      </Container>
    </>
  )
}
