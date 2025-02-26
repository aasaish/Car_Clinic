import React, { useState } from 'react';
import './VirtualAssistance.css';

const VirtualAssistance = () => {
  const [query, setQuery] = useState('');

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Query submitted: ${query}`);
  };

  return (
    <div className="virtual-assistance-container">
      <h1>Virtual Assistance</h1>
      <form onSubmit={handleSubmit} className="query-form">
        <div className="form-group">
          <label htmlFor="query">Your Query:</label>
          <textarea
            id="query"
            name="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask your question here..."
            required
          />
        </div>

        <div className="form-group">
          <button type="submit" className="submit-btn">
            Submit Query
          </button>
        </div>
      </form>
    </div>
  );
};

export default VirtualAssistance;
