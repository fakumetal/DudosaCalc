import React from 'react';

function TablaResultados({
  mejoresCombos,
  cuotas,
  usarExactamente,
  montoTotal,
  ordenPor,
  setOrdenPor,
  recalcular
}) {
  return (
    <div className="apuesta-optima-tabla-wrapper">
      <table className="apuesta-optima-tabla">
        <thead>
          <tr>
            <th>#</th>
            <th>
              Cuota 1<br /><span className="apuesta-optima-cuota-label">{cuotas[2]}</span>
            </th>
            {usarExactamente && (
              <th>
                Monto exactamente<br /><span className="apuesta-optima-cuota-label">Cuota {cuotas[1]}</span>
              </th>
            )}
            <th>
              Cuota 2<br /><span className="apuesta-optima-cuota-label">{cuotas[0]}</span>
            </th>
            <th>Ganancias/Pérdidas</th>
            <th
              className={ordenPor.campo === 'ganancia' ? 'apuesta-optima-th-active' : ''}
              onClick={() => {
                setOrdenPor(prev => ({
                  campo: 'ganancia',
                  asc: prev.campo === 'ganancia' ? !prev.asc : false
                }));
                setTimeout(() => recalcular(), 0);
              }}
              style={{ cursor: 'pointer' }}
            >
              Ganancia máxima
              <span className="apuesta-optima-th-arrow">
                {ordenPor.campo === 'ganancia' ? (ordenPor.asc ? '▲' : '▼') : ''}
              </span>
            </th>
            <th
              className={ordenPor.campo === 'perdida' ? 'apuesta-optima-th-active-perdida' : ''}
              onClick={() => {
                setOrdenPor(prev => ({
                  campo: 'perdida',
                  asc: prev.campo === 'perdida' ? !prev.asc : false
                }));
                setTimeout(() => recalcular(), 0);
              }}
              style={{ cursor: 'pointer' }}
            >
              Perdida máxima
              <span className="apuesta-optima-th-arrow">
                {ordenPor.campo === 'perdida' ? (ordenPor.asc ? '▲' : '▼') : ''}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {mejoresCombos.map((combo, idx) => (
            <tr key={idx} className={
              idx === 0
                ? 'apuesta-optima-row-best'
                : idx % 2 === 0
                  ? 'apuesta-optima-row-even'
                  : 'apuesta-optima-row-odd'
            }>
              <td className={idx === 0 ? 'apuesta-optima-td-best' : ''}>{idx + 1}</td>
              <td>${combo.montos[0].toFixed(2)}</td>
              {usarExactamente && (
                <td>${combo.montos[1].toFixed(2)}</td>
              )}
              <td>${combo.montos[usarExactamente ? 2 : 1].toFixed(2)}</td>
              <td>
                [
                {combo.ganancias.map((g, i) => (
                  <span key={i} className={g > 0 ? 'apuesta-optima-positivo' : 'apuesta-optima-negativo'}>
                    {g >= 0 ? '+' : ''}${g.toFixed(2)}{i < combo.ganancias.length - 1 ? ', ' : ''}
                  </span>
                ))}]
              </td>
              <td>
                ${Math.max(...combo.ganancias).toFixed(2)}{' '}
                <span className="apuesta-optima-positivo" style={{ fontWeight: 500, fontSize: 13 }}>
                  ({((Math.max(...combo.ganancias) / parseFloat(montoTotal)) * 100).toFixed(1)}%)
                </span>
              </td>
              <td>
                ${combo.minGan.toFixed(2)}{' '}
                <span className="apuesta-optima-porcentaje">
                  ({((combo.minGan / parseFloat(montoTotal)) * 100).toFixed(1)}%)
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaResultados;
