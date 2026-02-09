interface GenerationProgressProps {
  status: string;
}

export default function GenerationProgress({ status }: GenerationProgressProps) {
  return (
    <div style={{ textAlign: 'center', padding: '11.11vw 0' }}>
      <div
        style={{
          width: '22.22vw',
          height: '22.22vw',
          margin: '0 auto 6.67vw',
          border: '3px solid #614108',
          borderTop: '3px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <p style={{ fontSize: '4.44vw', fontWeight: 600, color: '#614108', marginBottom: '2.22vw' }}>
        AI가 프로필을 생성하고 있어요...
      </p>
      <p style={{ fontSize: '3.89vw', color: '#505050' }}>
        잠시만 기다려주세요
      </p>
      <p style={{ fontSize: '3.33vw', color: '#999', marginTop: '2.22vw' }}>
        상태: {status}
      </p>
    </div>
  );
}
