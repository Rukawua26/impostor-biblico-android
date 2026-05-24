# Impostor Biblico Network Server

Servidor separado para probar el modo multijugador en red antes de fusionarlo con la app principal.

## Desarrollo local

```sh
npm install
npm run dev
```

Health check:

```sh
curl http://localhost:3001/health
```

## Render

Configuracion recomendada:

- Runtime: Node
- Build command: `npm install`
- Start command: `npm run start:tsx`
- Health check path: `/health`
- Environment: gratis para pruebas

## Eventos Socket.IO

Cliente a servidor:

- `createRoom({ playerName })`
- `joinRoom({ roomCode, playerName })`
- `leaveRoom()`

Servidor a cliente:

- `roomUpdated(room)`
- `roomClosed({ reason })`
- `playerDisconnected({ playerId, playerName })`

## Alcance actual

Implementado:

- crear sala
- unirse a sala
- salir de sala
- desconexion elimina al jugador
- host se reasigna al jugador mas antiguo
- sala se borra si queda vacia

Pendiente:

- iniciar partida
- roles privados
- discusion sincronizada
- votacion sincronizada
- reglas de desconexion durante partida
