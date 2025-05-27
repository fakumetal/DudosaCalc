import React, { useState } from 'react';
import TablaResultados from './TablaResultados';
import './ApuestaOptima.css';

function ApuestaOptima() {
  const [montoTotal, setMontoTotal] = useState('');
  const [cuotas, setCuotas] = useState(['', '', '']);
  const [montos, setMontos] = useState([0, 0, 0]);
  const [ganancias, setGanancias] = useState([0, 0, 0]);
  const [resultado, setResultado] = useState(null);
  const [mejoresCombos, setMejoresCombos] = useState([]);
  const [ordenPor, setOrdenPor] = useState({ campo: 'perdida', asc: false });  
  const [usarExactamente, setUsarExactamente] = useState(false);
  const [soloPositivas, setSoloPositivas] = useState(true);
  const [soloPositivasExactamente, setSoloPositivasExactamente] = useState(false);

  const pasoBase = 10;  
  const handleCuotaChange = (index, value) => {
    const nuevasCuotas = [...cuotas];
    nuevasCuotas[index] = value;
    setCuotas(nuevasCuotas);
  };

  const calcular = () => {
    const m = parseFloat(montoTotal);
 
    const c = usarExactamente
      ? cuotas.map(Number)
      : [Number(cuotas[2]), Number(cuotas[0])];

    if (
      c.some(isNaN) ||
      isNaN(m) ||
      m <= 0 ||
      c.some(x => x <= 1) ||
      (!usarExactamente && (cuotas[2] === '' || cuotas[0] === ''))
    ) {
      setResultado('Verifica los datos ingresados.');
      setMejoresCombos([]);
      return;
    }

    let combinaciones = [];
    const paso = Math.max(pasoBase, m / 20) / 4; 

    if (usarExactamente) {
      for (let a = 0; a <= m; a += paso) {
        for (let b = 0; b <= m - a; b += paso) {
          let montoMasDe = a;
          let montoExactamente = b;
          let montoMenosDe = m - a - b;

          // Correspondencia correcta:
          // montoMasDe * cuotaMasDe, montoExactamente * cuotaExactamente, montoMenosDe * cuotaMenosDe
          const gMasDe = montoMasDe * c[2] - m;
          const gExactamente = montoExactamente * c[1] - m;
          const gMenosDe = montoMenosDe * c[0] - m;

          const gananciasNetas = [gMasDe, gExactamente, gMenosDe];
          const minGan = Math.min(...gananciasNetas);

          if (soloPositivasExactamente) {
            if (gananciasNetas.every(g => g > 0)) {
              combinaciones.push({
                montos: [montoMasDe, montoExactamente, montoMenosDe],
                ganancias: gananciasNetas,
                minGan,
              });
            }
          } else {
            const positivos = gananciasNetas.filter(g => g > 0).length;
            if (positivos >= 2) {
              combinaciones.push({
                montos: [montoMasDe, montoExactamente, montoMenosDe],
                ganancias: gananciasNetas,
                minGan,
              });
            }
          }
        }
      }
    } else {
      // Solo dos cuotas: más de y menos de (en ese orden)
      for (let a = 0; a <= m; a += paso) {
        let c1 = a; // más de
        let c2 = m - a; // menos de

        // Ganancias netas en cada escenario:
        const g1 = c1 * c[0] - m; // más de
        const g2 = c2 * c[1] - m; // menos de

        const gananciasNetas = [g1, g2];
        let minGan = Math.min(...gananciasNetas);

        if (soloPositivas) {
          if (g1 > 0 && g2 > 0) {
            minGan = 0;
            combinaciones.push({
              montos: [c1, c2],
              ganancias: gananciasNetas,
              minGan,
            });
          }
        } else {
          const positivos = gananciasNetas.filter(g => g > 0).length;
          if (positivos >= 1) {
            combinaciones.push({
              montos: [c1, c2],
              ganancias: gananciasNetas,
              minGan,
            });
          }
        }
      }
    }

    if (combinaciones.length === 0) {
      setResultado('No se encontró ninguna combinación con suficientes escenarios positivos.');
      setMejoresCombos([]);
      return;
    }

    // Ordenar por el criterio seleccionado
    let ordenadas = [...combinaciones];
    if (ordenPor.campo === 'perdida') {
      ordenadas.sort((a, b) => {
        if (a.minGan !== b.minGan) return ordenPor.asc ? a.minGan - b.minGan : b.minGan - a.minGan;
        return ordenPor.asc
          ? Math.max(...a.ganancias) - Math.max(...b.ganancias)
          : Math.max(...b.ganancias) - Math.max(...a.ganancias);
      });
    } else {
      ordenadas.sort((a, b) => {
        const maxA = Math.max(...a.ganancias);
        const maxB = Math.max(...b.ganancias);
        if (maxA !== maxB) return ordenPor.asc ? maxA - maxB : maxB - maxA;
        return ordenPor.asc ? a.minGan - b.minGan : b.minGan - a.minGan;
      });
    }

    // Mostrar top 15 (o 30 si quieres)
    const top15 = ordenadas.slice(0, 50);

    setMejoresCombos(top15);
    setMontos(top15[0].montos);
    setGanancias(top15[0].ganancias);
    setResultado('Mostrando las mejores combinaciones.');
  };

  return (
    <div className="apuesta-optima-container">
      <h2 className="apuesta-optima-title">Calculadora dudosa</h2>
      <div className="apuesta-optima-input-row">
        <label style={{ fontWeight: 500 }}>Monto total a apostar: </label>
        <input
          type="number"
          value={montoTotal}
          onChange={e => setMontoTotal(e.target.value)}
          min="1"
          className="apuesta-optima-input"
        />
      </div>

      {/* OPCION EXACTAMENTE */}
      <div className="apuesta-optima-input-row">
        <label>
          <input
            type="checkbox"
            checked={usarExactamente}
            onChange={e => {
              setUsarExactamente(e.target.checked);
              setMejoresCombos([]);
              setResultado(null);
              setMontos([0, 0, 0]);
              setGanancias([0, 0, 0]);
            }}
            style={{ marginRight: 8 }}
          />
          Incluir opción "exactamente"
        </label>
        {usarExactamente && (
          <label style={{ marginLeft: 24 }}>
            <input
              type="checkbox"
              checked={soloPositivasExactamente}
              onChange={e => setSoloPositivasExactamente(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Combinaciones con las 3 ganancias positivas
          </label>
        )}
        {!usarExactamente && (
          <label style={{ marginLeft: 24 }}>
            <input
              type="checkbox"
              checked={soloPositivas}
              onChange={e => setSoloPositivas(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Solo mostrar combinaciones con ambas ganancias positivas
          </label>
        )}
      </div>
      <div className="apuesta-optima-input-row">
        <label style={{ fontWeight: 500 }}>
          Cuotas ({usarExactamente ? 'más de, exactamente, menos de, etc...' : 'más de, menos de, etc...'}):
        </label>
        <input
          type="number"
          step="0.01"
          min="1.01"
          value={cuotas[2]}
          onChange={e => handleCuotaChange(2, e.target.value)}
          placeholder="Cuota más de"
          className="apuesta-optima-input"
        />
        {usarExactamente && (
          <input
            type="number"
            step="0.01"
            min="1.01"
            value={cuotas[1]}
            onChange={e => handleCuotaChange(1, e.target.value)}
            placeholder="Cuota exactamente"
            className="apuesta-optima-input"
          />
        )}
        <input
          type="number"
          step="0.01"
          min="1.01"
          value={cuotas[0]}
          onChange={e => handleCuotaChange(0, e.target.value)}
          placeholder="Cuota menos de"
          className="apuesta-optima-input"
        />
      </div>
      <button
        onClick={calcular}
        className="apuesta-optima-btn"
      >
        Calcular
      </button>

      {resultado && (
        <div className="apuesta-optima-resultado">
          <strong className="apuesta-optima-resultado-title">{resultado}</strong>
          {mejoresCombos.length > 0 && (
            <TablaResultados
              mejoresCombos={mejoresCombos}
              cuotas={cuotas}
              usarExactamente={usarExactamente}
              montoTotal={montoTotal}
              ordenPor={ordenPor}
              setOrdenPor={setOrdenPor}
              recalcular={calcular}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default ApuestaOptima;
