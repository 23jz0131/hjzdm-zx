import React, { useState } from 'react';
import UserSidebar from '../components/UserSidebar';
import './ComparisonHistoryPage.css';

interface HistoryItem {
  id: number;
  query: string;
  time: string;
  resultCount: number;
}

const ComparisonHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 1,
      query: 'iPhone 15',
      time: '2023-12-24 10:30',
      resultCount: 12
    },
    {
      id: 2,
      query: 'MacBook Air',
      time: '2023-12-23 15:45',
      resultCount: 8
    },
    {
      id: 3,
      query: 'AirPods Pro',
      time: '2023-12-22 09:20',
      resultCount: 5
    },
    {
      id: 4,
      query: 'iPad Air',
      time: '2023-12-21 14:10',
      resultCount: 7
    }
  ]);

  const clearHistory = () => {
    setHistory([]);
  };

  const searchAgain = (query: string) => {
    console.log(`再検索: ${query}`);
    // 実際のアプリケーションでは、価格比較ページに移動し検索語を渡す必要があります
  };

  return (
    <div className="comparison-history-page-wrapper" style={{ display: 'flex', maxWidth: '1200px', margin: '20px auto', gap: '20px', padding: '0 15px' }}>
      <UserSidebar />
      <div className="comparison-history-page" style={{ flex: 1, padding: '20px', margin: 0, maxWidth: 'none', background: '#fff' }}>
      <div className="header">
        <h2>価格比較履歴</h2>
        {history.length > 0 && (
          <button className="clear-button" onClick={clearHistory}>
            履歴をクリア
          </button>
        )}
      </div>
      
      {history.length === 0 ? (
        <div className="no-history">価格比較履歴がありません</div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className="history-item">
              <div className="history-info">
                <div className="query">{item.query}</div>
                <div className="details">
                  <span className="time">{item.time}</span>
                  <span className="result-count">{item.resultCount}件の結果</span>
                </div>
              </div>
              <div className="history-actions">
                <button 
                  className="search-again-button"
                  onClick={() => searchAgain(item.query)}
                >
                  再検索
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default ComparisonHistoryPage;