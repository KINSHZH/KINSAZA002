import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <h2 style={{ fontFamily: 'Times New Roman', fontSize: '48px', fontWeight: 'bold', color: '#808080', margin: 0 }}>404</h2>
      <p style={{ fontWeight: 'bold', fontSize: '16px' }}>Page Not Found</p>
      <p className="small-text" style={{ marginBottom: '20px' }}>The requested page does not exist.</p>
      <Link to="/" className="btn-1996">Return Home</Link>
    </div>
  );
}
