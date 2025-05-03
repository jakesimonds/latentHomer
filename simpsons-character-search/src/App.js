import React, { useState } from 'react';
import { Input, Button, Card, Typography } from 'antd';
import axios from 'axios';
import Plot from 'react-plotly.js';
import 'antd/dist/reset.css';

const { Title, Text } = Typography;

function App() {
  const [query, setQuery] = useState('');
  const [characters, setCharacters] = useState([]);
  const [tsneData, setTsneData] = useState(null);

  const handleSearch = async () => {
    try {
      const charResponse = await axios.get(`http://localhost:8000/query?q=${encodeURIComponent(query)}`);
      setCharacters(charResponse.data);
      const tsneResponse = await axios.get(`http://localhost:8000/tsne-data?q=${encodeURIComponent(query)}`);
      setTsneData(tsneResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Title level={2} style={{ textAlign: 'center', margin: 0, padding: 20 }}>
        Simpsons Character Search
      </Title>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '1800px',
        margin: '0 auto',
        gap: 24,
        padding: 24
      }}>
        {/* Left: Plot and search */}
        <div style={{ flex: 3, minWidth: 0 }}>
          <div style={{ display: 'flex', marginBottom: 20 }}>
            <Input
              placeholder="Search for Simpsons characters"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ marginRight: 10 }}
            />
            <Button type="primary" onClick={handleSearch}>
              Search
            </Button>
          </div>
          {tsneData && (
            <div>
              <Title level={4}>t-SNE Visualization</Title>
              <Plot
                data={[
                  {
                    x: tsneData.points.map(p => p[0]),
                    y: tsneData.points.map(p => p[1]),
                    text: tsneData.names,
                    hovertext: tsneData.descriptions,
                    mode: 'markers+text',
                    type: 'scatter',
                    name: 'Characters',
                    marker: { color: 'blue', size: 10 },
                    textposition: 'top center',
                    hoverinfo: 'text'
                  },
                  {
                    x: [tsneData.query_point[0]],
                    y: [tsneData.query_point[1]],
                    text: [tsneData.query_label],
                    mode: 'markers+text',
                    type: 'scatter',
                    name: 'Query',
                    marker: { color: 'red', size: 20, symbol: 'star' },
                    textposition: 'top center',
                    hoverinfo: 'text'
                  }
                ]}
                layout={{
                  autosize: true,
                  title: 't-SNE of Simpsons Character Embeddings',
                  showlegend: true,
                  margin: { l: 40, r: 40, t: 40, b: 40 }
                }}
                useResizeHandler={true}
                style={{ width: '100%', height: '80vh', minHeight: 500 }}
              />
            </div>
          )}
        </div>
        {/* Right: Character cards */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          minWidth: 320,
          maxWidth: 400
        }}>
          {characters.map((character) => (
            <Card
              key={character.name}
              hoverable
              cover={
                <img
                  alt={character.name}
                  src={`/photos/${character.photo}`}
                  style={{
                    height: 180,
                    objectFit: 'cover'
                  }}
                />
              }
            >
              <Card.Meta
                title={character.name}
                description={
                  <>
                    <Text ellipsis={{ rows: 3 }}>
                      {character.description}
                    </Text>
                    <div style={{ marginTop: 10 }}>
                      <Text strong>Similarity: </Text>
                      <Text>{(character.similarity * 100).toFixed(2)}%</Text>
                    </div>
                  </>
                }
              />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;