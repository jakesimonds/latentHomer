import React, { useState } from 'react';
import { Input, Button, Card, Row, Col, Typography } from 'antd';
import axios from 'axios';
import 'antd/dist/reset.css';

const { Title, Text } = Typography;

function App() {
  const [query, setQuery] = useState('');
  const [characters, setCharacters] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/query?q=${encodeURIComponent(query)}`);
      setCharacters(response.data);
    } catch (error) {
      console.error('Error fetching characters:', error);
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
    </div>
  );
}

export default App;