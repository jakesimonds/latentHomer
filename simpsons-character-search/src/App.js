import React, { useState } from 'react';
import { Input, Button, Card, Row, Col, Typography } from 'antd';
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
      // Fetch top 5 characters
      const charResponse = await axios.get(`http://localhost:8000/query?q=${encodeURIComponent(query)}`);
      setCharacters(charResponse.data);

      // Fetch t-SNE data
      const tsneResponse = await axios.get(`http://localhost:8000/tsne-data?q=${encodeURIComponent(query)}`);
      setTsneData(tsneResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div style={{ 
      maxWidth: 800, 
      margin: '0 auto', 
      padding: 20, 
      backgroundColor: '#f0f2f5' 
    }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 20 }}>
        Simpsons Character Search
      </Title>
      
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

      <Row gutter={[16, 16]}>
        {characters.map((character) => (
          <Col key={character.name} xs={24} sm={12} md={8}>
            <Card
              hoverable
              cover={
                <img 
                  alt={character.name} 
                  src={`/photos/${character.photo}`} 
                  style={{ 
                    height: 300, 
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
          </Col>
        ))}
      </Row>

      {/* t-SNE Plot */}
      {tsneData && (
        <div style={{ marginTop: 40 }}>
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
              width: 700,
              height: 500,
              title: 't-SNE of Simpsons Character Embeddings',
              showlegend: true
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;