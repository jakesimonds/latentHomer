import React, { useState, useEffect } from 'react';
import { Select, Button, Card, Typography } from 'antd';
import Plot from 'react-plotly.js';
import 'antd/dist/reset.css';
import './App.css';

const { Title, Text } = Typography;

// Cosine similarity function in JS
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

function App() {
  const [query, setQuery] = useState('');
  const [queries, setQueries] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [tsneData, setTsneData] = useState(null);
  const [tsnePrecomputed, setTsnePrecomputed] = useState({});
  const [charactersWithEmbeddings, setCharactersWithEmbeddings] = useState([]);
  const [queriesWithEmbeddings, setQueriesWithEmbeddings] = useState([]);

  // Load all static data on mount
  useEffect(() => {
    fetch('/queries.json')
      .then(res => res.json())
      .then(data => {
        setQueriesWithEmbeddings(data);
        setQueries(data.map(q => q.query));
        if (data.length > 0) setQuery(data[0].query);
      });

    fetch('/characters_with_embeddings.json')
      .then(res => res.json())
      .then(setCharactersWithEmbeddings);

    fetch('/tsne_precomputed.json')
      .then(res => res.json())
      .then(setTsnePrecomputed);
  }, []);

  const handleSearch = () => {
    if (!query) return;
    // Find the embedding for the selected query
    const queryObj = queriesWithEmbeddings.find(q => q.query === query);
    if (!queryObj) return;

    // Compute cosine similarity for all characters
    const similarities = charactersWithEmbeddings.map(character => {
      const similarity = cosineSimilarity(queryObj.embedding, character.embedding);
      const { embedding, ...characterWithoutEmbedding } = character;
      return { ...characterWithoutEmbedding, similarity };
    });

    // Sort and take top 5
    const top5 = similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
    setCharacters(top5);

    // Use precomputed t-SNE data
    if (tsnePrecomputed[query]) {
      setTsneData(tsnePrecomputed[query]);
    } else {
      setTsneData(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Title level={2} style={{ textAlign: 'center', margin: 0, padding: 20 }}>
        Simpsons Character Search
      </Title>
      <div className="main-flex-container">
        <div style={{ flex: 3, minWidth: 0 }}>
          <div style={{ display: 'flex', marginBottom: 20 }}>
            <Select
              style={{ minWidth: 250, marginRight: 10 }}
              value={query}
              onChange={setQuery}
              options={queries.map(q => ({ value: q, label: q }))}
              placeholder="Select a query"
            />
            <Button type="primary" onClick={handleSearch}>
              Search
            </Button>
          </div>
          {/* t-SNE Plot */}
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
                  height: 500,
                  legend: {
                    orientation: 'h',
                    y: -0.2,
                    x: 0.5,
                    xanchor: 'center'
                  },
                  margin: { l: 40, r: 20, t: 40, b: 40 },
                  title: 't-SNE of Simpsons Character Embeddings',
                  showlegend: true,
                }}
                useResizeHandler={true}
                style={{ width: '100%', minWidth: 0 }}
                config={{ responsive: true }}
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
          {characters.map((character, idx) => (
            <Card
              key={character.name}
              hoverable
              style={{ position: 'relative', marginBottom: 16 }}
              cover={
                <img
                  alt={character.name}
                  src={`/photos/${character.photo}`}
                  style={{
                    height: 180,
                    width: '100%',
                    objectFit: 'contain',
                    background: '#fff',
                    display: 'block',
                    margin: '0 auto'
                  }}
                />
              }
            >
              {/* Badge in the top left */}
              <div style={{
                position: 'absolute',
                top: 8,
                left: 8,
                background: '#1890ff',
                color: '#fff',
                borderRadius: 6,
                padding: '2px 10px',
                fontWeight: 'bold',
                fontSize: 14,
                zIndex: 2
              }}>
                {idx + 1}
                {idx === 0 ? 'st' : idx === 1 ? 'nd' : idx === 2 ? 'rd' : 'th'} most similar
              </div>
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