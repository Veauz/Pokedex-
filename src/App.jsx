import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [pokemones, setPokemones] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function cargarPokemones() {
      try {
        const respuesta = await fetch(
          'https://pokeapi.co/api/v2/pokemon?limit=30',
          { signal: controller.signal }
        )

        if (!respuesta.ok) {
          throw new Error('No se pudo obtener la lista de Pokémon.')
        }

        const datos = await respuesta.json()

        const detalles = await Promise.all(
          datos.results.map(async (pokemon) => {
            const respuestaDetalle = await fetch(pokemon.url, {
              signal: controller.signal,
            })

            if (!respuestaDetalle.ok) {
              throw new Error('No se pudieron cargar los Pokémon.')
            }

            return respuestaDetalle.json()
          })
        )

        setPokemones(detalles)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError('No se pudieron cargar los datos. Recarga la página.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false)
        }
      }
    }

    cargarPokemones()

    return () => controller.abort()
  }, [])

  const pokemonesFiltrados = pokemones.filter((pokemon) =>
    pokemon.name.includes(busqueda.trim().toLowerCase())
  )

  return (
    <main className="contenedor">
      <header className="encabezado">
        <span className="etiqueta">EXPLORA EL MUNDO POKÉMON</span>
        <h1>Pokédex</h1>
        <p>Descubre los primeros 30 Pokémon y sus características.</p>
      </header>

      <label className="buscador">
        Buscar por nombre
        <input
          type="search"
          placeholder="Por ejemplo: pikachu"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />
      </label>

      {cargando && <p role="status">Cargando Pokémon...</p>}

      {error && <p role="alert">{error}</p>}

      {!cargando && !error && (
        <>
          <p className="resultados">
            {pokemonesFiltrados.length} Pokémon encontrados
          </p>

          <section className="lista" aria-label="Lista de Pokémon">
            {pokemonesFiltrados.map((pokemon) => (
              <article className="tarjeta" key={pokemon.id}>
                <span className="numero">
                  #{String(pokemon.id).padStart(3, '0')}
                </span>

                <img
                  src={
                    pokemon.sprites.other['official-artwork'].front_default
                    || pokemon.sprites.front_default
                  }
                  alt={pokemon.name}
                  loading="lazy"
                />

                <h2>{pokemon.name}</h2>

                <div className="tipos">
                  {pokemon.types.map(({ type }) => (
                    <span className="tipo" key={type.name}>
                      {type.name}
                    </span>
                  ))}
                </div>

                <p className="peso">Peso: {pokemon.weight / 10} kg</p>
              </article>
            ))}
          </section>

          {pokemonesFiltrados.length === 0 && (
            <p>No hay Pokémon con ese nombre en esta lista.</p>
          )}
        </>
      )}

      <footer>Desarrollado con React · Datos de PokéAPI</footer>
    </main>
  )
}

export default App