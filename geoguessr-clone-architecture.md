# GeoGuessr Clone Architecture

## System Overview

```mermaid
graph LR
    A[GeoGuessr Clone] --> B[Game Engine]
    A --> C[Map Interface]
    A --> D[Scoring System]
    A --> E[Round Management]
    A --> F[UI Components]
    A --> G[Backend Services]

    B --> B1[Location Selection]
    B --> B2[Guess Validation]
    B --> B3[Distance Calculation]
    B --> B4[Round Logic]

    C --> C1[GebetaMap Component]
    C --> C2[Marker Management]
    C --> C3[Click Handlers]
    C --> C4[Map Controls]

    D --> D1[Distance Scoring]
    D --> D2[Point Calculation]
    D --> D3[Score Display]
    D --> D4[Leaderboard]

    E --> E1[Round Counter]
    E --> E2[Game State]
    E --> E3[Location Pool]
    E --> E4[Game Reset]

    F --> F1[Game Header]
    F --> F2[Score Panel]
    F --> F3[Round Info]
    F --> F4[Guess Button]
    F --> F5[Results Modal]

    G --> G1[User Management]
    G --> G2[Score Storage]
    G --> G3[Leaderboard API]
    G --> G4[Game History]
```

## Development Steps

```mermaid
flowchart TD
    A[Step 1: Project Setup] --> B[Step 2: Basic Map Integration]
    B --> C[Step 3: Game State Management]
    C --> D[Step 4: Location Selection System]
    D --> E[Step 5: Guess Placement Logic]
    E --> F[Step 6: Distance Calculation]
    F --> G[Step 7: Scoring System]
    G --> H[Step 8: Round Management]
    H --> I[Step 9: UI Components]
    I --> J[Step 10: Results Display]
    J --> K[Step 11: Backend Integration]
    K --> L[Step 12: Leaderboard System]


```

## Component Architecture

```mermaid
graph LR
    A[App Component] --> B[GameContainer]
    B --> C[MapComponent]
    B --> D[GameUI]
    B --> E[GameLogic]

    C --> C1[GebetaMap]
    C --> C2[MarkerManager]
    C --> C3[MapControls]

    D --> D1[Header]
    D --> D2[ScorePanel]
    D --> D3[RoundInfo]
    D --> D4[GuessButton]
    D --> D5[ResultsModal]

    E --> E1[GameState]
    E --> E2[LocationPool]
    E --> E3[ScoringEngine]
    E --> E4[RoundManager]
```

## Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant G as GameUI
    participant M as MapComponent
    participant L as GameLogic
    participant S as ScoringEngine

    U->>G: Start Game
    G->>L: Initialize Game
    L->>M: Load Random Location
    M->>U: Display Map

    U->>M: Click to Place Guess
    M->>L: Record Guess Location
    L->>S: Calculate Distance
    S->>L: Return Score
    L->>U: Display Results

    U->>G: Next Round
    G->>L: Start New Round
    L->>M: Load New Location
    M->>U: Reset Map
```

## Gebeta Tiles Integration Points

```mermaid
graph LR
    A[Gebeta Tiles SDK] --> B[Map Rendering]
    A --> C[Marker Management]
    A --> D[Geocoding APIs]
    A --> E[Distance Calculation]

    B --> B1[GebetaMap Component]
    B --> B2[Map Click Events]
    B --> B3[Map Controls]

    C --> C1[addMarker]
    C --> C2[addImageMarker]
    C --> C3[clearMarkers]
    C --> C4[Marker Click Handlers]

    D --> D1[geocode]
    D --> D2[reverseGeocode]
    D --> D3[getDirections]

    E --> E1[Coordinate Math]
    E --> E2[Haversine Formula]
    E --> E3[Distance Display]
```

## Blog Post Structure

1. **Introduction** - What we're building and why
2. **Setup** - Project initialization with Gebeta Tiles
3. **Basic Map** - Getting the map working
4. **Game Logic** - Core game mechanics
5. **UI Components** - Building the interface
6. **Scoring** - Distance calculation and points
7. **Rounds** - Managing multiple rounds
8. **Backend Integration** - Setting up the server
9. **Leaderboard System** - User management and scoring
10. **Conclusion** - What we learned and next steps 