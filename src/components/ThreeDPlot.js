// import Plot from 'react-plotly.js';

// export default function ThreeDPlot({ data }) {
//   // For X axis, we can convert dates to timestamps for numeric plotting
//   const x = data.map(d => new Date(d.Day).getTime()); // Date in ms
//   const y = data.map(d => d.Stake);
//   const z = data.map(d => d.Payout);
//   console.log('Loaded data:', data);


//   return (
//     <Plot
//       data={[
//         {
//           x,
//           y,
//           z,
//           mode: 'markers',
//           type: 'scatter3d',
//           marker: { size: 5, color: 'blue' },
//           name: 'Stake vs Payout vs Date',
//           hovertemplate: 
//             'Date: %{x}<br>' +
//             'Stake: %{y}<br>' +
//             'Payout: %{z}<extra></extra>',
//         },
//       ]}
//       layout={{
//         width: '100%',
//         height: '60vh',
//         showlegend: true,
//         title: '3D Scatter Plot: Date vs Stake vs Payout',
//         scene: {
//           xaxis: {
//             title: 'Date',
//             type: 'date',
//             tickformat: '%d-%m-%Y',
//           },
//           yaxis: { title: 'Stake' },
//           zaxis: { title: 'Payout' },
//         },
//       }}
//     />
//   );
// }

import Plot from 'react-plotly.js';

export default function ThreeDPlot({ data }) {
  const x = data.map(d => new Date(d.Day).getTime());
  const y = data.map(d => d.Stake);
  const z = data.map(d => d.Payout);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const markerSize = isMobile ? 3 : 6;
  const tickFontSize = isMobile ? 10 : 14;

  return (
    <div
      style={{
        width: '100%',
        height: '60vh',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '1rem',
      }}
    >
      <Plot
        data={[
          {
            x,
            y,
            z,
            mode: 'markers',
            type: 'scatter3d',
            marker: { size: markerSize, color: 'blue' },
            name: 'Stake vs Payout vs Date',
            hovertemplate:
              'Date: %{x}<br>Stake: %{y}<br>Payout: %{z}<extra></extra>',
          },
        ]}
        layout={{
          autosize: true,
          responsive: true,
          title: '3D Plot: Date vs Stake vs Payout',
          showlegend: true,
          scene: {
            xaxis: { title: 'Date', type: 'date', titlefont: { size: tickFontSize } },
            yaxis: { title: 'Stake', titlefont: { size: tickFontSize } },
            zaxis: { title: 'Payout', titlefont: { size: tickFontSize } },
          },
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
